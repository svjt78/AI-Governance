"""Governance controls and evaluations"""
from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class ControlCategory(str, Enum):
    """Control categories"""
    EXPLAINABILITY = "Explainability"
    DATA_BIAS = "Data&Bias"
    COMPLIANCE = "Compliance"
    RISK = "Risk"
    OPERATIONS = "Operations"


class ControlEvaluationStatus(str, Enum):
    """Control evaluation status"""
    PASSED = "passed"
    FAILED = "failed"
    NOT_APPLICABLE = "not_applicable"
    NEEDS_REVIEW = "needs_review"


class ControlCatalogEntry(BaseModel):
    """Governance control from catalog"""
    control_id: str
    framework_reference: str  # e.g., NAIC_AI_Principles
    regulatory_focus: str  # e.g., Unfair_Discrimination
    category: ControlCategory
    description: str
    mandatory_for_prod: bool = False
    applies_to_use_case_categories: List[str] = Field(default_factory=list)

    class Config:
        use_enum_values = True


class ControlEvaluation(BaseModel):
    """Model-specific control evaluation"""
    model_id: str
    control_id: str
    status: ControlEvaluationStatus
    rationale: str
    evidence_links: List[str] = Field(default_factory=list)
    last_updated: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
