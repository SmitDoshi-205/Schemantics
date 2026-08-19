from typing import Dict, List

from app.schema_comparator import DiffEntry

SEVERITY_BY_CHANGE_TYPE: Dict[str, str] = {
    "removed": "breaking",
    "type_changed": "breaking",
    "added": "warning",
}


def classify_severity(change_type: str) -> str:
    return SEVERITY_BY_CHANGE_TYPE.get(change_type, "info")


def with_severity(diffs: List[DiffEntry]) -> List[dict]:
    return [{**entry, "severity": classify_severity(entry["changeType"])} for entry in diffs]

from typing import Dict, List

from app.schema_comparator import DiffEntry

SEVERITY_BY_CHANGE_TYPE: Dict[str, str] = {
    "removed": "breaking",
    "type_changed": "breaking",
    "added": "warning",
}


def classify_severity(change_type: str) -> str:
    return SEVERITY_BY_CHANGE_TYPE.get(change_type, "info")


def with_severity(diffs: List[DiffEntry]) -> List[dict]:
    return [{**entry, "severity": classify_severity(entry["changeType"])} for entry in diffs]