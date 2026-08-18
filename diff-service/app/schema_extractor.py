from typing import Any, Dict


def extract_schema(data: Any, prefix: str = "") -> Dict[str, str]:
    schema: Dict[str, str] = {}

    if isinstance(data, dict):
        if not data:
            if prefix:
                schema[prefix] = "object"
            return schema

        for key, value in data.items():
            child_path = f"{prefix}.{key}" if prefix else str(key)
            schema.update(extract_schema(value, child_path))

    elif isinstance(data, list):
        list_path = f"{prefix}[]"

        if not data:
            schema[list_path] = "array"
        else:
            for item in data:
                schema.update(extract_schema(item, list_path))

    else:
        schema[prefix] = _type_name(data)

    return schema


def _type_name(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, (int, float)):
        return "number"
    if isinstance(value, str):
        return "string"
    return "unknown"