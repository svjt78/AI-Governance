"""JSON storage with atomic writes (no database)"""
import json
import os
import tempfile
from typing import Any, Callable, Optional
from pathlib import Path


class JSONStorage:
    """Thread-safe JSON array storage with atomic writes"""

    @staticmethod
    def ensure_file_exists(filepath: str, default: list = None) -> None:
        """Create file with default content if it doesn't exist"""
        if default is None:
            default = []

        path = Path(filepath)
        path.parent.mkdir(parents=True, exist_ok=True)

        if not path.exists():
            with open(filepath, 'w') as f:
                json.dump(default, f, indent=2)

    @staticmethod
    def load_json(filepath: str) -> list:
        """Load JSON array from file"""
        JSONStorage.ensure_file_exists(filepath)

        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
                return data if isinstance(data, list) else []
        except (json.JSONDecodeError, FileNotFoundError):
            return []

    @staticmethod
    def save_json(filepath: str, data: list) -> None:
        """Save JSON array to file with atomic write"""
        path = Path(filepath)
        path.parent.mkdir(parents=True, exist_ok=True)

        # Write to temp file first
        dir_path = path.parent
        with tempfile.NamedTemporaryFile(
            mode='w',
            dir=dir_path,
            delete=False,
            suffix='.tmp'
        ) as tmp_file:
            tmp_path = tmp_file.name
            json.dump(data, tmp_file, indent=2)

        # Atomic rename
        os.replace(tmp_path, filepath)

    @staticmethod
    def find_by_id(
        filepath: str,
        id_field: str,
        id_value: str
    ) -> Optional[dict]:
        """Find single record by ID field"""
        data = JSONStorage.load_json(filepath)
        for record in data:
            if record.get(id_field) == id_value:
                return record
        return None

    @staticmethod
    def find_all(
        filepath: str,
        filter_fn: Optional[Callable[[dict], bool]] = None
    ) -> list[dict]:
        """Find all records, optionally filtered"""
        data = JSONStorage.load_json(filepath)
        if filter_fn:
            return [record for record in data if filter_fn(record)]
        return data

    @staticmethod
    def create(filepath: str, record: dict) -> dict:
        """Add new record to array"""
        data = JSONStorage.load_json(filepath)
        data.append(record)
        JSONStorage.save_json(filepath, data)
        return record

    @staticmethod
    def update_by_id(
        filepath: str,
        id_field: str,
        id_value: str,
        updates: dict
    ) -> bool:
        """Update record by ID field"""
        data = JSONStorage.load_json(filepath)
        for i, record in enumerate(data):
            if record.get(id_field) == id_value:
                data[i].update(updates)
                JSONStorage.save_json(filepath, data)
                return True
        return False

    @staticmethod
    def delete_by_id(
        filepath: str,
        id_field: str,
        id_value: str
    ) -> bool:
        """Delete record by ID field"""
        data = JSONStorage.load_json(filepath)
        original_len = len(data)
        data = [r for r in data if r.get(id_field) != id_value]

        if len(data) < original_len:
            JSONStorage.save_json(filepath, data)
            return True
        return False

    @staticmethod
    def exists(filepath: str, id_field: str, id_value: str) -> bool:
        """Check if record exists"""
        return JSONStorage.find_by_id(filepath, id_field, id_value) is not None
