from app.schema_extractor import extract_schema

def test_flat_object():
    data = {"title": "Breaking News", "content": "Full article text", "id": 317}
    assert extract_schema(data) == {
        "title": "string",
        "content": "string",
        "id": "number",
    }


def test_nested_object():
    data = {"body": {"text": "hello"}}
    assert extract_schema(data) == {"body.text": "string"}


def test_deeply_nested_object():
    data = {"meta": {"author": {"name": "Jane", "verified": True}}}
    assert extract_schema(data) == {
        "meta.author.name": "string",
        "meta.author.verified": "boolean",
    }


def test_array_of_objects():
    data = {"tags": [{"name": "news"}, {"name": "sports"}]}
    assert extract_schema(data) == {"tags[].name": "string"}


def test_array_of_scalars():
    data = {"ids": [1, 2, 3]}
    assert extract_schema(data) == {"ids[]": "number"}


def test_array_of_strings():
    data = {"labels": ["a", "b", "c"]}
    assert extract_schema(data) == {"labels[]": "string"}


def test_empty_array():
    data = {"tags": []}
    assert extract_schema(data) == {"tags[]": "array"}


def test_empty_object():
    data = {"meta": {}}
    assert extract_schema(data) == {"meta": "object"}


def test_null_value():
    data = {"deletedAt": None}
    assert extract_schema(data) == {"deletedAt": "null"}


def test_boolean_value():
    data = {"active": True}
    assert extract_schema(data) == {"active": "boolean"}


def test_number_vs_boolean_not_confused():
    data = {"count": 5, "isActive": True}
    assert extract_schema(data) == {"count": "number", "isActive": "boolean"}


def test_nested_array_of_objects_with_nested_object():
    data = {
        "id": 317,
        "title": "Breaking News",
        "tags": [{"name": "news", "id": 1}],
        "meta": {"views": 100, "author": {"name": "Jane"}},
    }
    assert extract_schema(data) == {
        "id": "number",
        "title": "string",
        "tags[].name": "string",
        "tags[].id": "number",
        "meta.views": "number",
        "meta.author.name": "string",
    }


def test_root_level_array():
    data = [{"id": 1}, {"id": 2}]
    assert extract_schema(data) == {"[].id": "number"}


def test_heterogeneous_array_merges_all_keys():
    data = {"items": [{"a": 1}, {"b": "x"}]}
    assert extract_schema(data) == {"items[].a": "number", "items[].b": "string"}


def test_empty_top_level_object():
    assert extract_schema({}) == {}