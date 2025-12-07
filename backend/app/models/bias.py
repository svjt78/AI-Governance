"""Bias and unfair discrimination evaluation model"""
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class BiasTestStatus(str, Enum):
    """Bias test status"""
    ACCEPTABLE = "acceptable"
    NEEDS_REVIEW = "needs_review"
    UNACCEPTABLE = "unacceptable"


class CustomerHarmRisk(str, Enum):
    """Customer harm risk level"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class BiasEvaluation(BaseModel):
    """Bias / Unfair discrimination evaluation"""
    model_id: str
    test_scope: str  # e.g., "New_Business_Auto_Underwriting"
    protected_or_prohibited_factor: str  # e.g., "race", "gender", "zip_code_proxy"
    test_type: str
    metric: str
    value: float
    threshold: float
    status: BiasTestStatus
    mitigation_plan: Optional[str] = None
    customer_harm_risk: CustomerHarmRisk
    regulatory_concern_flag: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
