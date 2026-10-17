# First-Time PR Guard
Flags risky first-time-contributor PRs with evidence, not accusations. Rules decide the score; a local open model (Qwen2.5-Coder via Ollama) only explains it.

## Run
1. `ollama pull qwen2.5-coder`
2. `python -m venv venv && source venv/bin/activate` (Windows: `venv\Scripts\activate`)
3. `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and add your GitHub token
5. `cd backend && uvicorn main:app --reload`
6. Open http://localhost:8000

Switch models by changing `MODEL_NAME` (e.g. Gemma). A Low score is not a guarantee of safety.
