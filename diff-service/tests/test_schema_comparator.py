from app.schema_comparator import compare_schemas

def test_no_changes():
    baseline = {"title": "string", "id": "number"}
    new = {"title": "string", "id": "number"}
    assert compare_schemas(baseline, new) == []


def test_field_removed():
    baseline = {"title": "string", "content": "string"}
    new = {"title": "string"}
    assert compare_schemas(baseline, new) == [
        {"path": "content", "changeType": "removed", "oldType": "string", "newType": None},
    ]


def test_field_added():
    baseline = {"title": "string"}
    new = {"title": "string", "subtitle": "string"}
    assert compare_schemas(baseline, new) == [
        {"path": "subtitle", "changeType": "added", "oldType": None, "newType": "string"},
    ]


def test_field_type_changed():
    baseline = {"id": "number"}
    new = {"id": "string"}
    assert compare_schemas(baseline, new) == [
        {"path": "id", "changeType": "type_changed", "oldType": "number", "newType": "string"},
    ]


def test_multiple_changes_together():
    baseline = {"title": "string", "content": "string", "id": "number"}
    new = {"title": "string", "id": "string", "subtitle": "string"}
    result = compare_schemas(baseline, new)
    assert result == [
        {"path": "content", "changeType": "removed", "oldType": "string", "newType": None},
        {"path": "id", "changeType": "type_changed", "oldType": "number", "newType": "string"},
        {"path": "subtitle", "changeType": "added", "oldType": None, "newType": "string"},
    ]


def test_empty_baseline_everything_is_added():
    baseline = {}
    new = {"title": "string", "id": "number"}
    result = compare_schemas(baseline, new)
    assert result == [
        {"path": "id", "changeType": "added", "oldType": None, "newType": "number"},
        {"path": "title", "changeType": "added", "oldType": None, "newType": "string"},
    ]


def test_empty_new_everything_is_removed():
    baseline = {"title": "string", "id": "number"}
    new = {}
    result = compare_schemas(baseline, new)
    assert result == [
        {"path": "id", "changeType": "removed", "oldType": "number", "newType": None},
        {"path": "title", "changeType": "removed", "oldType": "string", "newType": None},
    ]


def test_both_empty():
    assert compare_schemas({}, {}) == []


def test_nested_paths():
    baseline = {"body.text": "string", "tags[].name": "string"}
    new = {"body.text": "string", "tags[].name": "number"}
    assert compare_schemas(baseline, new) == [
        {"path": "tags[].name", "changeType": "type_changed", "oldType": "string", "newType": "number"},
    ]


def test_result_is_sorted_by_path():
    baseline = {"zebra": "string"}
    new = {"apple": "string", "mango": "number", "zebra": "boolean"}
    result = compare_schemas(baseline, new)
    paths = [d["path"] for d in result]
    assert paths == sorted(paths)