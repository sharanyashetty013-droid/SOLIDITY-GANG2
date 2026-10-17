"""Rules engine: scans PR diffs, returns findings with file, line, reason, weight, snippet.
No evidence = no flag. Wording is neutral on purpose."""
import re

HOOK_FILES = re.compile(r"(^|/)(setup\.py|setup\.cfg|pyproject\.toml|Makefile|Dockerfile|install\.sh|postinstall\.\w+|\.github/workflows/[^/]+)$")
DEP_FILES = re.compile(r"(^|/)(requirements[^/]*\.txt|package\.json|Pipfile|go\.mod|Cargo\.toml|pom\.xml|build\.gradle)$")
DOC_FILES = re.compile(r"\.(md|txt|rst)$", re.I)

LINE_RULES = [  # (name, regex, weight, reason)
    ("hook", re.compile(r'"(pre|post)?install"\s*:'), 4, "Install script entry changed"),
    ("network", re.compile(r"\b\d{1,3}(\.\d{1,3}){3}\b"), 3, "Hard-coded IP address"),
    ("network", re.compile(r"https?://", re.I), 2, "Hard-coded URL"),
    ("network", re.compile(r"requests\.(get|post|put)|urllib|httpx\.|fetch\(|axios|XMLHttpRequest|socket\.|curl |wget ", re.I), 2, "New outbound network call"),
    ("exec", re.compile(r"\beval\s*\(|\bexec\s*\(|os\.system|subprocess|child_process|Runtime\.getRuntime|\bFunction\s*\("), 4, "Dynamic code or shell execution"),
    ("exec", re.compile(r"base64\.(b64)?decode|atob\(|fromCharCode|\\x[0-9a-f]{2}\\x[0-9a-f]{2}", re.I), 3, "Encoded or obfuscated string"),
    ("secrets", re.compile(r"os\.environ|os\.getenv|process\.env|System\.getenv|GITHUB_TOKEN|\.aws/credentials|id_rsa|\.npmrc|\.ssh", re.I), 3, "Reads environment variables or credential files"),
]
DEP_LINE = re.compile(r'^\s*("?[A-Za-z0-9_.@/\-]+"?\s*(==|>=|<=|~=|:)\s*"?[\^~]?[\w.\-*]+"?,?|[A-Za-z0-9_.\-]+)\s*$')

POPULAR = {"requests","numpy","pandas","flask","django","fastapi","urllib3","setuptools","boto3","pytest","scipy",
    "pillow","matplotlib","cryptography","beautifulsoup4","sqlalchemy","pydantic","httpx","tensorflow","torch",
    "express","react","lodash","axios","moment","webpack","typescript","jquery","chalk","commander","colors",
    "eslint","vue","next","mongoose","dotenv","uuid","debug","request","async","underscore"}


def _dist(a, b):
    """Edit distance where swapping two neighbouring letters counts as 1."""
    d = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a) + 1): d[i][0] = i
    for j in range(len(b) + 1): d[0][j] = j
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            c = 0 if a[i-1] == b[j-1] else 1
            d[i][j] = min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + c)
            if i > 1 and j > 1 and a[i-1] == b[j-2] and a[i-2] == b[j-1]:
                d[i][j] = min(d[i][j], d[i-2][j-2] + 1)
    return d[-1][-1]


def lookalike(line):
    """Return the popular package this dependency line is suspiciously close to, else None."""
    m = re.match(r'\s*"?([A-Za-z0-9_.\-]+)"?', line)
    if not m:
        return None
    name = m.group(1).lower().replace("_", "-")
    if name in POPULAR or len(name) < 5:
        return None
    for p in POPULAR:
        if len(p) >= 5 and _dist(name, p) == 1:
            return p
    return None


def added_lines(patch):
    """Yield (new_line_number, text) for every added line in a unified diff."""
    n = 0
    for raw in (patch or "").splitlines():
        if raw.startswith("@@"):
            m = re.search(r"\+(\d+)", raw)
            n = int(m.group(1)) if m else 0
        elif raw.startswith("+") and not raw.startswith("+++"):
            yield n, raw[1:]
            n += 1
        elif raw.startswith("-") or raw.startswith("\\"):
            continue
        else:
            n += 1


def _f(file, line, reason, weight, snippet=""):
    return {"file": file, "line": line, "reason": reason + " - worth a closer look", "weight": weight, "snippet": snippet.strip()[:120]}


def scan(files, pr=None):
    out, seen = [], set()

    def add(*a):
        f = _f(*a)
        k = (f["file"], f["line"], f["reason"])
        if k not in seen:
            seen.add(k)
            out.append(f)

    total_add = 0
    for fl in files:
        name, patch = fl.get("filename", ""), fl.get("patch")
        total_add += fl.get("additions", 0)
        lines = list(added_lines(patch))
        first = lines[0][0] if lines else 0
        is_doc = bool(DOC_FILES.search(name))

        if HOOK_FILES.search(name):
            add(name, first, "Install, build or CI file changed", 3)
        if DEP_FILES.search(name):
            for n, t in lines:
                if DEP_LINE.match(t) and not t.strip().startswith(("{", "}")):
                    add(name, n, "New or changed dependency", 2, t)
                    real = lookalike(t)
                    if real:
                        add(name, n, f"Package name is one letter away from the popular package '{real}'", 5, t)
        if fl.get("status") == "added" and not patch and fl.get("additions", 0) == 0:
            add(name, 0, "Binary file added", 3)
        if re.search(r"\.min\.(js|css)$", name):
            add(name, first, "Minified file added", 3)

        if is_doc:
            continue
        for n, t in lines:
            if len(t) > 400:
                add(name, n, "Very long (possibly minified) line", 2, t[:80])
            for _, rx, w, reason in LINE_RULES:
                if rx.search(t):
                    add(name, n, reason, w, t)

    if pr and total_add > 300:
        words = [w for w in re.findall(r"[a-z]{4,}", (pr.get("title") or "").lower())]
        names = " ".join(f.get("filename", "").lower() for f in files)
        if words and not any(w in names for w in words):
            add("(whole PR)", 0, "Large change that doesn't obviously match the PR title", 2)
    return out


def score(findings, trust_points=0):
    """Rule weights + a small trust modifier (max +2). Trust alone never flags a PR."""
    code = sum(f["weight"] for f in findings)
    total = code + (min(trust_points, 2) if code > 0 else 0)
    level = "High" if total >= 7 else "Medium" if total >= 3 else "Low"
    return level, total
