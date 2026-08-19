from typing import Dict, List, Optional, TypedDict

class DiffEntry(TypedDict):
    path: str
    changeType: str  #"added" | "removed" | "type_changed"
    oldType: Optional[str]
    newType: Optional[str]


def compare_schemas(baseline_schema: Dict[str, str], new_schema: Dict[str, str]) -> List[DiffEntry]:
    diffs: List[DiffEntry] = []

    baseline_paths = set(baseline_schema.keys())
    new_paths = set(new_schema.keys())

    removed_paths = baseline_paths - new_paths
    added_paths = new_paths - baseline_paths
    shared_paths = baseline_paths & new_paths

    for path in removed_paths:
        diffs.append(
            {
                "path": path,
                "changeType": "removed",
                "oldType": baseline_schema[path],
                "newType": None,
            }
        )

    for path in added_paths:
        diffs.append(
            {
                "path": path,
                "changeType": "added",
                "oldType": None,
                "newType": new_schema[path],
            }
        )

    for path in shared_paths:
        old_type = baseline_schema[path]
        new_type = new_schema[path]
        if old_type != new_type:
            diffs.append(
                {
                    "path": path,
                    "changeType": "type_changed",
                    "oldType": old_type,
                    "newType": new_type,
                }
            )

    diffs.sort(key=lambda d: d["path"])

    return diffs