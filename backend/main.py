"""First-Time PR Guard API. Run: uvicorn main:app --reload  (from backend/)"""
import time
import httpx
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")
from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import github as gh
from rules import scan, score
from explain import explain, MODEL

app = FastAPI(title="First-Time PR Guard")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
CACHE, TTL = {}, 120
STATIC = Path(__file__).parent / "static"
STATIC.mkdir(exist_ok=True)


class ExplainIn(BaseModel):
    level: str
    findings: list


@app.get("/api/health")
def health():
    try:
        httpx.get("http://localhost:11434", timeout=2)
        ai = True
    except Exception:
        ai = False
    return {"ok": True, "model": MODEL, "ai_running": ai}


@app.get("/api/scan/{owner}/{repo}")
def scan_repo(owner: str, repo: str, x_github_token: str | None = Header(default=None)):
    key = (owner, repo, x_github_token or "")
    if key in CACHE and time.time() - CACHE[key][0] < TTL:
        return CACHE[key][1]
    results = []
    with gh._client(x_github_token) as c:
        for pr in gh.open_prs(c, owner, repo):
            if not gh.is_first_time(c, owner, repo, pr):
                continue
            findings = scan(gh.pr_files(c, owner, repo, pr["number"]), pr)
            t = gh.trust(c, pr)
            level, total = score(findings, t["points"])
            results.append(dict(number=pr["number"], title=pr["title"], author=pr["user"]["login"],
                                url=pr["html_url"], level=level, total=total, findings=findings, trust=t))
    order = {"High": 0, "Medium": 1, "Low": 2}
    results.sort(key=lambda r: (order[r["level"]], -r["total"]))
    out = {"results": results}
    CACHE[key] = (time.time(), out)
    return out


@app.post("/api/explain")
def explain_pr(body: ExplainIn):
    text, model = explain(body.level, body.findings)
    return {"text": text, "model": model}


# keep this LAST so /api routes take priority
app.mount("/", StaticFiles(directory=STATIC, html=True), name="static")