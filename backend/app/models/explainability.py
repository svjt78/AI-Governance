"""Explainability evaluation model"""
from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class ExplainabilityMethod(str, Enum):
    """Explainability methods"""
    SHAP = "shap"
    LIME = "lime"
    GLOBAL_FEATURE_IMPORTANCE = "global_feature_importance"
    LOCAL_EXPLANATIONS = "local_explanations"
    PROMPT_TRACE = "prompt_trace"
    AGENT_TRACE = "agent_trace"


class ExplainabilityEvaluation(BaseModel):
    """Explainability evaluation"""
    model_id: str
    decision_context: str  # e.g., "New_Business_Underwriting"
    method: ExplainabilityMethod
    summary: str
    key_findings: List[str] = Field(default_factory=list)
    limitations: str = ""
    attachment_refs: List[str] = Field(default_factory=list)
    explainability_score: Optional[float] = Field(None, ge=0, le=100)
    suitable_for_customer_communication: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
