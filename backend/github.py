"""GitHub API access: open PRs, first-time detection, files, trust signals."""
import os
import time
from datetime import datetime, timezone
import httpx
from fastapi import HTTPException

API = "https://api.github.com"


def _client(token):
    token = token or os.getenv("GITHUB_TOKEN", "")
    h = {"Accept": "application/vnd.github+json"}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return httpx.Client(base_url=API, headers=h, timeout=30)


def get(c, path, **params):
    for attempt in range(4):
        r = c.get(path, params=params)
        if r.status_code not in (403, 429):
            break
        wait = None
        if r.headers.get("retry-after"):
            wait = int(r.headers["retry-after"])
        elif r.headers.get("x-ratelimit-remaining") == "0":
            wait = max(1, int(r.headers.get("x-ratelimit-reset", 0)) - int(time.time()) + 1)
        if wait is None:
            raise HTTPException(403, "GitHub refused this request. The repo may restrict access.")
        if wait > 90:  # real hourly limit, waiting won't help
            raise HTTPException(429, "GitHub hourly limit reached. Try again later.")
        if attempt == 3:
            raise HTTPException(429, "GitHub is busy. Wait a minute and try again.")
        time.sleep(wait)
    if r.status_code == 404:
        raise HTTPException(404, "Repository not found, or it is private and needs a token.")
    if r.status_code == 401:
        raise HTTPException(401, "GitHub rejected the token. Check it and try again.")
    r.raise_for_status()
    return r.json()


def open_prs(c, owner, repo):
    return get(c, f"/repos/{owner}/{repo}/pulls", state="open", per_page=25)


def is_first_time(c, owner, repo, pr):
    a = pr.get("author_association")
    if a in ("FIRST_TIME_CONTRIBUTOR", "FIRST_TIMER"):
        return True
    if a in ("OWNER", "MEMBER", "COLLABORATOR", "CONTRIBUTOR"):
        return False  # CONTRIBUTOR = already has commits in this repo
    q = f"repo:{owner}/{repo} type:pr is:merged author:{pr['user']['login']}"
    return get(c, "/search/issues", q=q).get("total_count", 0) == 0


def pr_files(c, owner, repo, number):
    return get(c, f"/repos/{owner}/{repo}/pulls/{number}/files", per_page=100)


def trust(c, pr):
    sig, pts = [], 0
    try:
        u = get(c, f"/users/{pr['user']['login']}")
        days = (datetime.now(timezone.utc) - datetime.fromisoformat(u["created_at"].replace("Z", "+00:00"))).days
        if days < 30:
            pts += 1; sig.append(f"Account created recently ({days} days ago)")
        else:
            sig.append(f"Account is {max(1, days // 30)} months old")
        if u.get("public_repos", 0) == 0:
            pts += 1; sig.append("No public repositories yet")
        else:
            sig.append(f"{u['public_repos']} public repositories")
    except HTTPException:
        sig.append("Profile details unavailable")
    if not (pr.get("body") or "").strip():
        pts += 1; sig.append("PR description is empty")
    else:
        sig.append("PR has a description")
    return {"points": pts, "signals": sig}