from typing import Any, Dict, List

from fastapi import FastAPI
from pydantic import BaseModel

from app.schema_comparator import DiffEntry, compare_schemas
from app.schema_extractor import extract_schema
from app.severity import with_severity

app = FastAPI(
    title="Schemantics Diff Service",
    description="Internal microservice: extracts and compares API response schemas.",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "schemantics-diff-service"}


class DiffRequest(BaseModel):
    baselineSchema: Dict[str, str]
    newResponseJson: Any = None


@app.post("/diff")
def diff(request: DiffRequest) -> List[dict]:
    new_schema = extract_schema(request.newResponseJson)
    raw_diffs = compare_schemas(request.baselineSchema, new_schema)
    return with_severity(raw_diffs)