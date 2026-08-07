from fastapi import FastAPI

app = FastAPI(title="Factory Health CRM", version="1.0.0")


@app.get("/health")
def health():
    return {"status": "ok", "project": "Factory Health CRM"}
