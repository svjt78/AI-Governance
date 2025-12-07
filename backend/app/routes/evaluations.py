"""Evaluations API routes (explainability, drift, bias, RAG, risk)"""
import os
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException

from app.models.explainability import ExplainabilityEvaluation
from app.models.drift import DriftEvaluation
from app.models.bias import BiasEvaluation
from app.models.rag import RAGEvaluation
from app.models.risk import RiskAssessment
from app.models.controls import ControlEvaluation
from app.storage.json_storage import JSONStorage
from app.storage.ndjson_storage import NDJSONStorage
from app.services.audit_logger import AuditLogger
from app.config import settings

router = APIRouter()

MODELS_FILE = os.path.join(settings.data_dir, "models.json")
EXPLAINABILITY_FILE = os.path.join(settings.data_dir, "explainability.ndjson")
DRIFT_FILE = os.path.join(settings.data_dir, "drift.ndjson")
BIAS_FILE = os.path.join(settings.data_dir, "bias.ndjson")
RAG_FILE = os.path.join(settings.data_dir, "rag_evaluations.ndjson")
RISK_FILE = os.path.join(settings.data_dir, "risk_assessments.ndjson")
CONTROL_EVAL_FILE = os.path.join(settings.data_dir, "control_evaluations.ndjson")


def verify_model_exists(model_id: str) -> None:
    """Verify that a model exists"""
    model = JSONStorage.find_by_id(MODELS_FILE, "model_id", model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")


# Explainability endpoints
@router.post("/models/{model_id}/explainability")
async def create_explainability_evaluation(model_id: str, evaluation: ExplainabilityEvaluation):
    """Add explainability evaluation for a model"""
    verify_model_exists(model_id)

    evaluation.model_id = model_id
    NDJSONStorage.append(EXPLAINABILITY_FILE, evaluation.model_dump(mode='json'))

    AuditLogger.log(
        action_type="add_explainability",
        entity_type="explainability",
        entity_id=model_id,
        model_id=model_id,
        new_value=evaluation.model_dump(mode='json')
    )

    return {"status": "success", "message": "Explainability evaluation added"}


@router.get("/models/{model_id}/explainability", response_model=List[ExplainabilityEvaluation])
async def get_explainability_evaluations(model_id: str):
    """Get all explainability evaluations for a model"""
    verify_model_exists(model_id)
    evaluations = NDJSONStorage.get_all_for_model(EXPLAINABILITY_FILE, model_id, sort_by="timestamp")
    return [ExplainabilityEvaluation(**e) for e in evaluations]


# Drift endpoints
@router.post("/models/{model_id}/drift")
async def create_drift_evaluation(model_id: str, evaluation: DriftEvaluation):
    """Add drift evaluation for a model"""
    verify_model_exists(model_id)

    evaluation.model_id = model_id
    NDJSONStorage.append(DRIFT_FILE, evaluation.model_dump(mode='json'))

    AuditLogger.log(
        action_type="add_drift",
        entity_type="drift",
        entity_id=model_id,
        model_id=model_id,
        new_value=evaluation.model_dump(mode='json')
    )

    return {"status": "success", "message": "Drift evaluation added"}


@router.get("/models/{model_id}/drift", response_model=List[DriftEvaluation])
async def get_drift_evaluations(model_id: str):
    """Get all drift evaluations for a model"""
    verify_model_exists(model_id)
    evaluations = NDJSONStorage.get_all_for_model(DRIFT_FILE, model_id, sort_by="timestamp")
    return [DriftEvaluation(**e) for e in evaluations]


# Bias endpoints
@router.post("/models/{model_id}/bias")
async def create_bias_evaluation(model_id: str, evaluation: BiasEvaluation):
    """Add bias/unfair discrimination evaluation for a model"""
    verify_model_exists(model_id)

    evaluation.model_id = model_id
    NDJSONStorage.append(BIAS_FILE, evaluation.model_dump(mode='json'))

    AuditLogger.log(
        action_type="add_bias_test",
        entity_type="bias",
        entity_id=model_id,
        model_id=model_id,
        new_value=evaluation.model_dump(mode='json')
    )

    return {"status": "success", "message": "Bias evaluation added"}


@router.get("/models/{model_id}/bias", response_model=List[BiasEvaluation])
async def get_bias_evaluations(model_id: str):
    """Get all bias evaluations for a model"""
    verify_model_exists(model_id)
    evaluations = NDJSONStorage.get_all_for_model(BIAS_FILE, model_id, sort_by="timestamp")
    return [BiasEvaluation(**e) for e in evaluations]


# RAG endpoints
@router.post("/models/{model_id}/rag-evaluations")
async def create_rag_evaluation(model_id: str, evaluation: RAGEvaluation):
    """Add RAG evaluation for a model"""
    verify_model_exists(model_id)

    evaluation.model_id = model_id
    NDJSONStorage.append(RAG_FILE, evaluation.model_dump(mode='json'))

    AuditLogger.log(
        action_type="add_rag_evaluation",
        entity_type="rag_evaluation",
        entity_id=model_id,
        model_id=model_id,
        new_value=evaluation.model_dump(mode='json')
    )

    return {"status": "success", "message": "RAG evaluation added"}


@router.get("/models/{model_id}/rag-evaluations", response_model=List[RAGEvaluation])
async def get_rag_evaluations(model_id: str):
    """Get all RAG evaluations for a model"""
    verify_model_exists(model_id)
    evaluations = NDJSONStorage.get_all_for_model(RAG_FILE, model_id, sort_by="timestamp")
    return [RAGEvaluation(**e) for e in evaluations]


# Risk endpoints
@router.post("/models/{model_id}/risk-assessments")
async def create_risk_assessment(model_id: str, assessment: RiskAssessment):
    """Add risk assessment for a model"""
    verify_model_exists(model_id)

    assessment.model_id = model_id
    NDJSONStorage.append(RISK_FILE, assessment.model_dump(mode='json'))

    AuditLogger.log(
        action_type="add_risk_assessment",
        entity_type="risk_assessment",
        entity_id=model_id,
        model_id=model_id,
        new_value=assessment.model_dump(mode='json')
    )

    return {"status": "success", "message": "Risk assessment added"}


@router.get("/models/{model_id}/risk-assessments", response_model=List[RiskAssessment])
async def get_risk_assessments(model_id: str):
    """Get all risk assessments for a model"""
    verify_model_exists(model_id)
    assessments = NDJSONStorage.get_all_for_model(RISK_FILE, model_id, sort_by="timestamp")
    return [RiskAssessment(**a) for a in assessments]


# Governance summary endpoint
@router.get("/models/{model_id}/governance-summary")
async def get_governance_summary(model_id: str) -> Dict[str, Any]:
    """Get comprehensive governance summary for a model"""
    verify_model_exists(model_id)

    # Get model details
    model = JSONStorage.find_by_id(MODELS_FILE, "model_id", model_id)

    # Get latest evaluations
    control_evals = NDJSONStorage.get_all_for_model(CONTROL_EVAL_FILE, model_id)
    explainability_evals = NDJSONStorage.get_all_for_model(EXPLAINABILITY_FILE, model_id, sort_by="timestamp")
    drift_evals = NDJSONStorage.get_all_for_model(DRIFT_FILE, model_id, sort_by="timestamp")
    bias_evals = NDJSONStorage.get_all_for_model(BIAS_FILE, model_id, sort_by="timestamp")
    rag_evals = NDJSONStorage.get_all_for_model(RAG_FILE, model_id, sort_by="timestamp")
    risk_assessments = NDJSONStorage.get_all_for_model(RISK_FILE, model_id, sort_by="timestamp")

    # Calculate control stats
    control_stats = {
        "total": len(control_evals),
        "passed": len([c for c in control_evals if c.get("status") == "passed"]),
        "failed": len([c for c in control_evals if c.get("status") == "failed"]),
        "needs_review": len([c for c in control_evals if c.get("status") == "needs_review"]),
        "not_applicable": len([c for c in control_evals if c.get("status") == "not_applicable"])
    }

    # Get latest of each type
    latest_explainability = explainability_evals[0] if explainability_evals else None
    latest_drift = drift_evals[0] if drift_evals else None
    latest_bias = bias_evals[0] if bias_evals else None
    latest_rag = rag_evals[0] if rag_evals else None
    latest_risk = risk_assessments[0] if risk_assessments else None

    # Check for bias concerns
    bias_flags = [b for b in bias_evals if b.get("regulatory_concern_flag")]
    drift_breaches = [d for d in drift_evals if d.get("status") == "breached"]

    return {
        "model": model,
        "governance_status": model.get("governance_status"),
        "control_evaluations": {
            "stats": control_stats,
            "evaluations": control_evals
        },
        "explainability": {
            "count": len(explainability_evals),
            "latest": latest_explainability
        },
        "drift": {
            "count": len(drift_evals),
            "latest": latest_drift,
            "breaches": len(drift_breaches)
        },
        "bias": {
            "count": len(bias_evals),
            "latest": latest_bias,
            "regulatory_concerns": len(bias_flags)
        },
        "rag": {
            "count": len(rag_evals),
            "latest": latest_rag
        },
        "risk": {
            "count": len(risk_assessments),
            "latest": latest_risk
        }
    }
