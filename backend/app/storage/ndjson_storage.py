"""NDJSON storage for append-only logs (no database)"""
import json
from pathlib import Path
from typing import Callable, Optional


class NDJSONStorage:
    """Append-only NDJSON storage for event logs and evaluations"""

    @staticmethod
    def ensure_file_exists(filepath: str) -> None:
        """Create empty file if it doesn't exist"""
        path = Path(filepath)
        path.parent.mkdir(parents=True, exist_ok=True)

        if not path.exists():
            path.touch()

    @staticmethod
    def append(filepath: str, record: dict) -> None:
        """Append single record to NDJSON file"""
        NDJSONStorage.ensure_file_exists(filepath)

        with open(filepath, 'a') as f:
            f.write(json.dumps(record) + '\n')

    @staticmethod
    def read_all(filepath: str) -> list[dict]:
        """Read all records from NDJSON file"""
        NDJSONStorage.ensure_file_exists(filepath)

        records = []
        try:
            with open(filepath, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        try:
                            records.append(json.loads(line))
                        except json.JSONDecodeError:
                            continue
        except FileNotFoundError:
            pass

        return records

    @staticmethod
    def filter_records(
        filepath: str,
        filter_fn: Optional[Callable[[dict], bool]] = None,
        **filters
    ) -> list[dict]:
        """Filter records by key-value pairs or custom function"""
        records = NDJSONStorage.read_all(filepath)

        # Apply key-value filters
        if filters:
            records = [
                r for r in records
                if all(r.get(k) == v for k, v in filters.items())
            ]

        # Apply custom filter function
        if filter_fn:
            records = [r for r in records if filter_fn(r)]

        return records

    @staticmethod
    def get_latest_for_model(
        filepath: str,
        model_id: str,
        sort_by: str = 'timestamp'
    ) -> Optional[dict]:
        """Get most recent record for a specific model"""
        records = NDJSONStorage.filter_records(filepath, model_id=model_id)

        if not records:
            return None

        # Sort by timestamp/date field (descending)
        records.sort(
            key=lambda x: x.get(sort_by, ''),
            reverse=True
        )

        return records[0]

    @staticmethod
    def get_all_for_model(
        filepath: str,
        model_id: str,
        sort_by: str = 'timestamp'
    ) -> list[dict]:
        """Get all records for a specific model, sorted"""
        records = NDJSONStorage.filter_records(filepath, model_id=model_id)

        # Sort by timestamp/date field (descending)
        records.sort(
            key=lambda x: x.get(sort_by, ''),
            reverse=True
        )

        return records

    @staticmethod
    def count(filepath: str, **filters) -> int:
        """Count records matching filters"""
        records = NDJSONStorage.filter_records(filepath, **filters)
        return len(records)
