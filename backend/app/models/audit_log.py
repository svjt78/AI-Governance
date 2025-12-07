"""Audit log model"""
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


class AuditLogEntry(BaseModel):
    """Audit log entry"""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_id: str = "system"  # Default to system until auth is added
    action_type: str
    model_id: Optional[str] = None
    entity_type: str
    entity_id: str
    old_value: Optional[Any] = None
    new_value: Optional[Any] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
