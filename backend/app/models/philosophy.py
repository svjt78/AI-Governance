"""Governance philosophy model"""
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class PhilosophyScope(str, Enum):
    """Philosophy scope"""
    ORG = "org"
    BUSINESS_DOMAIN = "business_domain"
    LINE_OF_BUSINESS = "line_of_business"
    MODEL = "model"


class GovernancePhilosophy(BaseModel):
    """AI Governance philosophy (insurance-specific)"""
    scope: PhilosophyScope
    scope_ref: str  # e.g., "enterprise", "P&C_Commercial", "WC", model_id
    risk_appetite: str = ""
    fairness_and_unfair_discrimination_principles: str = ""
    external_data_and_vendor_controls: str = ""
    regulatory_alignment_principles: str = ""
    safety_and_customer_protection_principles: str = ""
    explainability_and_customer_communication: str = ""
    auditability_and_DOI_exam_readiness: str = ""
    lifecycle_governance: str = ""
    generated_by_llm: bool = False
    source_prompt_ref: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
