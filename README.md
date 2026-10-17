# First-Time PR Guard (PRism)

Flags risky pull requests from **first-time contributors**, with evidence, not accusations.

Rules decide the score. A local open model (Qwen2.5-Coder via Ollama) only explains it in plain words.

## What it does

1. Paste a GitHub repo (e.g. `vercel/next.js`).
2. It finds open PRs from first-time contributors.
3. It scans each PR's changed files for risky patterns (install hooks, hard-coded IPs, minified files, new dependencies, etc.).
4. It ranks PRs High / Medium / Low, showing the file, line, and reason for every flag.

## How it works

- **Backend:** FastAPI (`backend/`). Rules in `rules.py`, GitHub calls in `github.py`, AI explanation in `explain.py`.
- **Frontend:** React + Vite (`pr-guard-ui/`).
- **AI:** Ollama, local and optional. It never changes the score.

## Run locally

```
pip install -r requirements.txt
cp .env.example .env        # add your GITHUB_TOKEN
cd backend
python -m uvicorn main:app --reload
```

Open http://localhost:8000 (the built frontend is served by the backend).

For frontend development, in a second terminal:

```
cd pr-guard-ui
npm install
npm run dev
```

Open http://localhost:5173

### Optional: AI explanations

```
ollama pull qwen2.5-coder
```

Change `MODEL_NAME` in `.env` to switch models.


## Limits

- A Low score is **not** a guarantee of safety.
- Flags are evidence to review, not proof of bad intent.
- Without a `GITHUB_TOKEN`, GitHub rate limits apply.
- Never commit your `.env`.
EOF
git add README.md
git commit -m "Improve README"
git push origin main
