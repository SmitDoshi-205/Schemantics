from fastapi import FastAPI

app = FastAPI(
    title="Schemantics Diff Service",
    description="Internal microservice: extracts and compares API response schemas.",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "schemantics-diff-service"}