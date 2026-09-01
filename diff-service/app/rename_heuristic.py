from typing import List


def apply_rename_heuristic(diffs: List[dict]) -> List[dict]:
    removed = [d for d in diffs if d["changeType"] == "removed"]
    added = [d for d in diffs if d["changeType"] == "added"]

    if len(removed) == 1 and len(added) == 1 and removed[0]["oldType"] == added[0]["newType"]:
        r, a = removed[0], added[0]
        rest = [d for d in diffs if d is not r and d is not a]
        rename_entry = {
            "path": f'{r["path"]} -> {a["path"]}',
            "changeType": "possible_rename",
            "oldPath": r["path"],
            "newPath": a["path"],
            "oldType": r["oldType"],
            "newType": a["newType"],
            "severity": "warning",
        }
        return [rename_entry] + rest

    return diffs