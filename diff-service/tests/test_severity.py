from app.severity import classify_severity, with_severity

def test_removed_is_breaking():
    assert classify_severity("removed") == "breaking"

def test_type_changed_is_breaking():
    assert classify_severity("type_changed") == "breaking"

def test_added_is_warning():
    assert classify_severity("added") == "warning"

def test_unknown_change_type_defaults_to_info():
    assert classify_severity("something_unrecognized") == "info"

def test_with_severity_attaches_correct_field_to_each_entry():
    diffs = [
        {"path": "content", "changeType": "removed", "oldType": "string", "newType": None},
        {"path": "headline", "changeType": "added", "oldType": None, "newType": "string"},
        {"path": "id", "changeType": "type_changed", "oldType": "number", "newType": "string"},
    ]
    result = with_severity(diffs)
    assert result == [
        {"path": "content", "changeType": "removed", "oldType": "string", "newType": None, "severity": "breaking"},
        {"path": "headline", "changeType": "added", "oldType": None, "newType": "string", "severity": "warning"},
        {"path": "id", "changeType": "type_changed", "oldType": "number", "newType": "string", "severity": "breaking"},
    ]

def test_with_severity_does_not_mutate_input():
    diffs = [{"path": "a", "changeType": "removed", "oldType": "string", "newType": None}]
    with_severity(diffs)
    assert "severity" not in diffs[0]

def test_with_severity_empty_list():
    assert with_severity([]) == []