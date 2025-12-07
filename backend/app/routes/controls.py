"""Controls and evaluations API routes"""
import os
from typing import List
from fastapi import APIRouter, HTTPException

from app.models.controls import ControlCatalogEntry, ControlEvaluation, ControlCategory
from app.storage.json_storage import JSONStorage
from app.storage.ndjson_storage import NDJSONStorage
from app.services.audit_logger import AuditLogger
from app.config import settings

router = APIRouter()

CONTROLS_FILE = os.path.join(settings.data_dir, "controls.json")
CONTROL_EVALUATIONS_FILE = os.path.join(settings.data_dir, "control_evaluations.ndjson")


# Initialize default control catalog
DEFAULT_CONTROLS = [
    {
        "control_id": "NAIC-AI-01",
        "framework_reference": "NAIC_AI_Principles",
        "regulatory_focus": "Unfair_Discrimination",
        "category": ControlCategory.DATA_BIAS.value,
        "description": "Ensure AI models do not unfairly discriminate based on protected classes (race, gender, etc.) in insurance decisions.",
        "mandatory_for_prod": True,
        "applies_to_use_case_categories": ["Pricing", "Underwriting", "Claims"]
    },
    {
        "control_id": "NAIC-AI-02",
        "framework_reference": "NAIC_AI_Principles",
        "regulatory_focus": "External_Data",
        "category": ControlCategory.COMPLIANCE.value,
        "description": "Document and govern the use of external data sources (e.g., credit scores, telematics) in accordance with state DOI regulations.",
        "mandatory_for_prod": True,
        "applies_to_use_case_categories": ["Pricing", "Underwriting"]
    },
    {
        "control_id": "NAIC-AI-03",
        "framework_reference": "NAIC_AI_Principles",
        "regulatory_focus": "Consumer_Transparency",
        "category": ControlCategory.EXPLAINABILITY.value,
        "description": "Provide clear, understandable explanations for AI-driven insurance decisions to consumers.",
        "mandatory_for_prod": True,
        "applies_to_use_case_categories": ["Pricing", "Underwriting", "Claims"]
    },
    {
        "control_id": "NAIC-AI-04",
        "framework_reference": "Model_Documentation_For_DOI",
        "regulatory_focus": "Audit_Readiness",
        "category": ControlCategory.COMPLIANCE.value,
        "description": "Maintain comprehensive model documentation for state DOI market conduct examinations.",
        "mandatory_for_prod": True,
        "applies_to_use_case_categories": ["Pricing", "Underwriting", "Claims", "Fraud"]
    },
    {
        "control_id": "NAIC-AI-05",
        "framework_reference": "NAIC_AI_Principles",
        "regulatory_focus": "Data_Governance",
        "category": ControlCategory.OPERATIONS.value,
        "description": "Implement data quality controls and lineage tracking for AI model training data.",
        "mandatory_for_prod": True,
        "applies_to_use_case_categories": ["Pricing", "Underwriting", "Claims", "Fraud"]
    },
    {
        "control_id": "NAIC-AI-06",
        "framework_reference": "NAIC_AI_Principles",
        "regulatory_focus": "Model_Validation",
        "category": ControlCategory.RISK.value,
        "description": "Conduct independent model validation including backtesting and sensitivity analysis.",
        "mandatory_for_prod": True,
        "applies_to_use_case_categories": ["Pricing", "Underwriting", "Claims"]
    },
    {
        "control_id": "NAIC-AI-07",
        "framework_reference": "NAIC_AI_Principles",
        "regulatory_focus": "Ongoing_Monitoring",
        "category": ControlCategory.OPERATIONS.value,
        "description": "Implement ongoing monitoring for model drift, bias, and performance degradation.",
        "mandatory_for_prod": True,
        "applies_to_use_case_categories": ["Pricing", "Underwriting", "Claims", "Fraud"]
    },
    {
        "control_id": "NAIC-AI-08",
        "framework_reference": "Third_Party_Risk",
        "regulatory_focus": "Vendor_Management",
        "category": ControlCategory.RISK.value,
        "description": "Establish vendor risk management for third-party AI models and data providers.",
        "mandatory_for_prod": True,
        "applies_to_use_case_categories": ["Pricing", "Underwriting", "Claims", "Fraud", "Marketing"]
    },
    {
        "control_id": "NAIC-AI-09",
        "framework_reference": "NAIC_AI_Principles",
        "regulatory_focus": "Adverse_Action",
        "category": ControlCategory.COMPLIANCE.value,
        "description": "Provide adverse action notices with specific reasons when AI drives unfavorable decisions.",
        "mandatory_for_prod": True,
        "applies_to_use_case_categories": ["Underwriting", "Claims"]
    },
    {
        "control_id": "NAIC-AI-10",
        "framework_reference": "Data_Privacy",
        "regulatory_focus": "Consumer_Privacy",
        "category": ControlCategory.COMPLIANCE.value,
        "description": "Ensure AI models comply with data privacy regulations and consumer consent requirements.",
        "mandatory_for_prod": True,
        "applies_to_use_case_categories": ["Pricing", "Underwriting", "Claims", "Marketing", "Customer_Service"]
    },
    {
        "control_id": "RAG-01",
        "framework_reference": "Generative_AI_Controls",
        "regulatory_focus": "Hallucination_Prevention",
        "category": ControlCategory.RISK.value,
        "description": "Implement grounding and citation mechanisms to prevent hallucinations in insurance copilots.",
        "mandatory_for_prod": True,
        "applies_to_use_case_categories": ["Operational_Copilot", "Customer_Service"]
    },
    {
        "control_id": "RAG-02",
        "framework_reference": "Generative_AI_Controls",
        "regulatory_focus": "Coverage_Accuracy",
        "category": ControlCategory.RISK.value,
        "description": "Validate that AI-generated policy and coverage explanations are accurate and not misleading.",
        "mandatory_for_prod": True,
        "applies_to_use_case_categories": ["Operational_Copilot", "Customer_Service", "Underwriting"]
    },
    {
        "control_id": "FAIR-01",
        "framework_reference": "Fair_Lending_Principles",
        "regulatory_focus": "Proxy_Variables",
        "category": ControlCategory.DATA_BIAS.value,
        "description": "Test for and mitigate proxy discrimination (e.g., ZIP code as proxy for race).",
        "mandatory_for_prod": True,
        "applies_to_use_case_categories": ["Pricing", "Underwriting"]
    },
    {
        "control_id": "FAIR-02",
        "framework_reference": "Fair_Lending_Principles",
        "regulatory_focus": "Disparate_Impact",
        "category": ControlCategory.DATA_BIAS.value,
        "description": "Conduct disparate impact analysis across protected classes.",
        "mandatory_for_prod": True,
        "applies_to_use_case_categories": ["Pricing", "Underwriting", "Claims"]
    },
    {
        "control_id": "XAI-01",
        "framework_reference": "Explainability_Standards",
        "regulatory_focus": "Technical_Explainability",
        "category": ControlCategory.EXPLAINABILITY.value,
        "description": "Implement technical explainability methods (SHAP, LIME) for model decisions.",
        "mandatory_for_prod": False,
        "applies_to_use_case_categories": ["Pricing", "Underwriting", "Claims", "Fraud"]
    }
]


def initialize_control_catalog():
    """Initialize control catalog if empty"""
    controls = JSONStorage.load_json(CONTROLS_FILE)
    if not controls:
        JSONStorage.save_json(CONTROLS_FILE, DEFAULT_CONTROLS)


@router.get("/controls", response_model=List[ControlCatalogEntry])
async def get_controls():
    """Get governance control catalog"""
    initialize_control_catalog()
    controls = JSONStorage.load_json(CONTROLS_FILE)
    return [ControlCatalogEntry(**c) for c in controls]


@router.post("/models/{model_id}/controls/evaluations")
async def create_control_evaluations(model_id: str, evaluations: List[ControlEvaluation]):
    """Create or update control evaluations for a model"""
    # Verify model exists
    from app.storage.json_storage import JSONStorage as ModelStorage
    models_file = os.path.join(settings.data_dir, "models.json")
    model = ModelStorage.find_by_id(models_file, "model_id", model_id)

    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    # Append evaluations
    for evaluation in evaluations:
        evaluation.model_id = model_id
        NDJSONStorage.append(CONTROL_EVALUATIONS_FILE, evaluation.model_dump(mode='json'))

        # Log audit event
        AuditLogger.log(
            action_type="update_control_evaluation",
            entity_type="control_evaluation",
            entity_id=f"{model_id}_{evaluation.control_id}",
            model_id=model_id,
            new_value=evaluation.model_dump(mode='json')
        )

    return {"status": "success", "message": f"Updated {len(evaluations)} control evaluations"}


@router.get("/models/{model_id}/controls/evaluations", response_model=List[ControlEvaluation])
async def get_control_evaluations(model_id: str):
    """Get all control evaluations for a model"""
    evaluations = NDJSONStorage.get_all_for_model(
        CONTROL_EVALUATIONS_FILE,
        model_id,
        sort_by="last_updated"
    )

    return [ControlEvaluation(**e) for e in evaluations]
