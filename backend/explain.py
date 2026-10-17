"""Plain-language explanation from a local open model via Ollama.
The model never sets the score; it only sees the rule findings."""
import os
import httpx

MODEL = os.getenv("MODEL_NAME", "qwen2.5-coder")
URL = os.getenv("OLLAMA_URL", "http://localhost:11434")


def explain(level, findings):
    real = [f for f in findings if f["weight"] > 0][:12]
    ev = "\n".join(f"- {f['file']}:{f['line']} {f['reason']} {('(' + f['snippet'] + ')') if f.get('snippet') else ''}" for f in real)
    prompt = (
        f"You help a maintainer review a first-time pull request. Risk level: {level}. "
        "Use ONLY the evidence below and cite file:line for every claim. Never comment on the person. "
        'Use welcoming wording like "worth a closer look". If the evidence is empty, say no risky patterns were found. '
        f"Write 2 to 3 sentences, then a short list of what to check.\n\nEvidence:\n{ev or '(none)'}"
    )
    try:
        r = httpx.post(f"{URL}/api/chat", timeout=180, json={"model": MODEL, "stream": False,
                       "messages": [{"role": "user", "content": prompt}]})
        r.raise_for_status()
        return r.json()["message"]["content"], MODEL
    except Exception:
        return (f"Explanation unavailable. The evidence above is still valid. To enable it, install Ollama, "
                f"run: ollama pull {MODEL} and make sure Ollama is running."), MODEL
