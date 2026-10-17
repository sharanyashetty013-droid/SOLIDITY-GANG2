# START HERE (do in order)
1. Copy everything in this folder into your repo folder. If you have your own restyled `index.html`, put it in `backend/static/` (replace the placeholder).
2. Copy `.env.example` to `.env`. Put your GitHub token after GITHUB_TOKEN=.
3. Terminal in the main folder: `pip install -r requirements.txt` then `ollama pull qwen2.5-coder`
4. `cd backend` then `python test_rules.py`  -> must show 5 "ok" lines
5. `uvicorn main:app --reload`, open http://localhost:8000/api/health -> shows ok true and ai_running true
6. Open http://localhost:8000, type owner/repo, click Scan, click Explain
7. Push: `cd ..` / `git status` (.env must NOT be listed) / `git checkout -b first-time-pr-guard` / `git add .` / `git commit -m "Add First-Time PR Guard backend"` / `git push -u origin first-time-pr-guard`

Also in this folder: `JUDGES-QA.md` (answers to likely questions).
Use `python -m pip` and `python -m uvicorn` on Windows Git Bash. Ollama: `ollama pull qwen2.5-coder`.
