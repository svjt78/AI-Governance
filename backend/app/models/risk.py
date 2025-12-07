"""Risk assessment model"""
from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    """Risk levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RiskAssessment(BaseModel):
    """Model risk assessment"""
    model_id: str
    risk_score: float = Field(ge=0, le=100)
    risk_level: RiskLevel
    primary_risk_drivers: List[str] = Field(default_factory=list)
    business_impact_summary: str
    mitigation_plan: str = ""
    residual_risk_accepted: bool = False
    residual_risk_approver: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
