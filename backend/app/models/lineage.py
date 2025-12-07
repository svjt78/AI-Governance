"""Lineage tracking model"""
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class LineageEntry(BaseModel):
    """Model lineage snapshot"""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    model_id: str
    event_type: str = "lineage_snapshot"
    data_sources: List[str] = Field(default_factory=list)
    external_data_sources: List[str] = Field(default_factory=list)
    training_pipeline: Optional[str] = None
    feature_store_refs: List[str] = Field(default_factory=list)
    artifacts: Dict = Field(default_factory=dict)
    deployment: Dict = Field(default_factory=dict)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
