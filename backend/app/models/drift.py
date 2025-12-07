"""Drift monitoring model"""
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class DriftType(str, Enum):
    """Drift types"""
    DATA = "data"
    PREDICTION = "prediction"
    CONCEPT = "concept"


class DriftStatus(str, Enum):
    """Drift status"""
    WITHIN_TOLERANCE = "within_tolerance"
    BREACHED = "breached"


class DriftEvaluation(BaseModel):
    """Drift evaluation"""
    model_id: str
    drift_type: DriftType
    metric: str
    value: float
    threshold: float
    status: DriftStatus
    observation_window: str
    insurance_impact_summary: str
    notes: str = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
