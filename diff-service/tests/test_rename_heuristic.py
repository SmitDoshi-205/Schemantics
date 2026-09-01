from app.rename_heuristic import apply_rename_heuristic


def test_detects_matching_type_rename():
    diffs = [
        {"path": "content", "changeType": "removed", "oldType": "string", "newType": None, "severity": "breaking"},
        {"path": "headline", "changeType": "added", "oldType": None, "newType": "string", "severity": "warning"},
    ]
    result = apply_rename_heuristic(diffs)
    assert len(result) == 1
    assert result[0]["changeType"] == "possible_rename"
    assert result[0]["oldPath"] == "content"
    assert result[0]["newPath"] == "headline"
    assert result[0]["severity"] == "warning"


def test_no_rename_when_types_differ():
    diffs = [
        {"path": "content", "changeType": "removed", "oldType": "string", "newType": None, "severity": "breaking"},
        {"path": "id", "changeType": "added", "oldType": None, "newType": "number", "severity": "warning"},
    ]
    assert apply_rename_heuristic(diffs) == diffs


def test_no_rename_with_multiple_removed():
    diffs = [
        {"path": "a", "changeType": "removed", "oldType": "string", "newType": None, "severity": "breaking"},
        {"path": "b", "changeType": "removed", "oldType": "string", "newType": None, "severity": "breaking"},
        {"path": "c", "changeType": "added", "oldType": None, "newType": "string", "severity": "warning"},
    ]
    assert apply_rename_heuristic(diffs) == diffs


def test_no_changes_passthrough():
    assert apply_rename_heuristic([]) == []