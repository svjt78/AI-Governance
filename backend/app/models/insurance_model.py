"""Insurance AI Model - Core entity"""
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
import uuid


class ModelType(str, Enum):
    """AI model types"""
    LLM = "llm"
    RAG = "rag"
    AGENT = "agent"
    CLASSIFIER = "classifier"
    REGRESSOR = "regressor"
    RULES_PLUS_MODEL = "rules_plus_model"


class BusinessDomain(str, Enum):
    """Insurance business domains"""
    PC_PERSONAL = "P&C_Personal"
    PC_COMMERCIAL = "P&C_Commercial"
    REINSURANCE = "Reinsurance"
    SPECIALTY = "Specialty"


class LineOfBusiness(str, Enum):
    """Lines of business"""
    PERSONAL_AUTO = "Personal Auto"
    HOMEOWNERS = "Homeowners"
    COMMERCIAL_AUTO = "Commercial Auto"
    WORKERS_COMPENSATION = "Workers_Compensation"
    GL = "GL"
    PROPERTY = "Property"


class UseCaseCategory(str, Enum):
    """Use case categories"""
    PRICING = "Pricing"
    UNDERWRITING = "Underwriting"
    CLAIMS = "Claims"
    FRAUD = "Fraud"
    MARKETING = "Marketing"
    CUSTOMER_SERVICE = "Customer_Service"
    OPERATIONAL_COPILOT = "Operational_Copilot"


class GovernanceStatus(str, Enum):
    """Governance status"""
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    APPROVED_FOR_PROD = "approved_for_prod"
    TEMPORARILY_SUSPENDED = "temporarily_suspended"
    RETIRED = "retired"


class DeploymentEnvironment(str, Enum):
    """Deployment environments"""
    DEV = "dev"
    TEST = "test"
    PROD = "prod"


class InsuranceAIModel(BaseModel):
    """Insurance AI Model entity"""
    model_id: str = Field(default_factory=lambda: f"model_{uuid.uuid4().hex[:12]}")
    name: str
    version: str
    model_type: ModelType
    business_domain: BusinessDomain
    line_of_business: LineOfBusiness
    use_case_category: UseCaseCategory
    detailed_use_case: str
    owner_team: str
    product_or_program: str
    jurisdictions: List[str]  # State codes
    deployment_environment: DeploymentEnvironment
    deployment_details: Dict = Field(default_factory=dict)
    external_data_sources: List[str] = Field(default_factory=list)
    governance_status: GovernanceStatus = GovernanceStatus.DRAFT
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class InsuranceAIModelCreate(BaseModel):
    """Model creation request"""
    name: str
    version: str
    model_type: ModelType
    business_domain: BusinessDomain
    line_of_business: LineOfBusiness
    use_case_category: UseCaseCategory
    detailed_use_case: str
    owner_team: str
    product_or_program: str
    jurisdictions: List[str]
    deployment_environment: DeploymentEnvironment
    deployment_details: Dict = Field(default_factory=dict)
    external_data_sources: List[str] = Field(default_factory=list)
    governance_status: GovernanceStatus = GovernanceStatus.DRAFT

    class Config:
        use_enum_values = True
