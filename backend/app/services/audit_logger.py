"""Audit logging service"""
import os
from typing import Any, Optional
from app.models.audit_log import AuditLogEntry
from app.storage.ndjson_storage import NDJSONStorage
from app.config import settings


class AuditLogger:
    """Service for logging audit events"""

    @staticmethod
    def log(
        action_type: str,
        entity_type: str,
        entity_id: str,
        model_id: Optional[str] = None,
        old_value: Optional[Any] = None,
        new_value: Optional[Any] = None,
        user_id: str = "system"
    ) -> None:
        """Log an audit event"""
        entry = AuditLogEntry(
            user_id=user_id,
            action_type=action_type,
            model_id=model_id,
            entity_type=entity_type,
            entity_id=entity_id,
            old_value=old_value,
            new_value=new_value
        )

        filepath = os.path.join(settings.data_dir, "audit_log.ndjson")
        NDJSONStorage.append(filepath, entry.model_dump(mode='json'))
