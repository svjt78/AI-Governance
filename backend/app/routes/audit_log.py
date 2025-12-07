"""Audit log API routes"""
import os
from typing import List, Optional
from fastapi import APIRouter, Query

from app.models.audit_log import AuditLogEntry
from app.storage.ndjson_storage import NDJSONStorage
from app.config import settings

router = APIRouter()

AUDIT_LOG_FILE = os.path.join(settings.data_dir, "audit_log.ndjson")


@router.get("/audit-log", response_model=List[AuditLogEntry])
async def get_audit_log(
    model_id: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    action_type: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get audit log with optional filters"""
    logs = NDJSONStorage.read_all(AUDIT_LOG_FILE)

    # Apply filters
    if model_id:
        logs = [log for log in logs if log.get('model_id') == model_id]

    if entity_type:
        logs = [log for log in logs if log.get('entity_type') == entity_type]

    if action_type:
        logs = [log for log in logs if log.get('action_type') == action_type]

    # Sort by timestamp descending
    logs.sort(key=lambda x: x.get('timestamp', ''), reverse=True)

    # Limit results
    logs = logs[:limit]

    return [AuditLogEntry(**log) for log in logs]
