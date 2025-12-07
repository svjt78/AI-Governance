"""Models and lineage API routes"""
import os
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from datetime import datetime

from app.models.insurance_model import (
    InsuranceAIModel,
    InsuranceAIModelCreate,
    BusinessDomain,
    LineOfBusiness,
    UseCaseCategory,
    GovernanceStatus
)
from app.models.lineage import LineageEntry
from app.storage.json_storage import JSONStorage
from app.storage.ndjson_storage import NDJSONStorage
from app.services.audit_logger import AuditLogger
from app.config import settings

router = APIRouter()

MODELS_FILE = os.path.join(settings.data_dir, "models.json")
LINEAGE_FILE = os.path.join(settings.data_dir, "lineage.ndjson")


@router.post("/models", response_model=InsuranceAIModel)
async def create_model(model_data: InsuranceAIModelCreate):
    """Register a new AI model"""
    # Create model with generated ID and timestamps
    model = InsuranceAIModel(**model_data.model_dump())

    # Check if model_id already exists
    if JSONStorage.exists(MODELS_FILE, "model_id", model.model_id):
        raise HTTPException(status_code=400, detail="Model ID already exists")

    # Save to storage
    JSONStorage.create(MODELS_FILE, model.model_dump(mode='json'))

    # Log audit event
    AuditLogger.log(
        action_type="create_model",
        entity_type="model",
        entity_id=model.model_id,
        model_id=model.model_id,
        new_value=model.model_dump(mode='json')
    )

    return model


@router.get("/models", response_model=List[InsuranceAIModel])
async def list_models(
    business_domain: Optional[BusinessDomain] = Query(None),
    line_of_business: Optional[LineOfBusiness] = Query(None),
    use_case_category: Optional[UseCaseCategory] = Query(None),
    governance_status: Optional[GovernanceStatus] = Query(None),
    jurisdiction: Optional[str] = Query(None)
):
    """List all models with optional filters"""
    models = JSONStorage.load_json(MODELS_FILE)

    # Apply filters
    if business_domain:
        models = [m for m in models if m.get("business_domain") == business_domain.value]

    if line_of_business:
        models = [m for m in models if m.get("line_of_business") == line_of_business.value]

    if use_case_category:
        models = [m for m in models if m.get("use_case_category") == use_case_category.value]

    if governance_status:
        models = [m for m in models if m.get("governance_status") == governance_status.value]

    if jurisdiction:
        models = [m for m in models if jurisdiction in m.get("jurisdictions", [])]

    return [InsuranceAIModel(**m) for m in models]


@router.get("/models/{model_id}", response_model=InsuranceAIModel)
async def get_model(model_id: str):
    """Get a specific model by ID"""
    model = JSONStorage.find_by_id(MODELS_FILE, "model_id", model_id)

    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    return InsuranceAIModel(**model)


@router.post("/models/{model_id}/lineage")
async def add_lineage(model_id: str, lineage_data: LineageEntry):
    """Add lineage snapshot for a model"""
    # Verify model exists
    model = JSONStorage.find_by_id(MODELS_FILE, "model_id", model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    # Set model_id and timestamp
    lineage_data.model_id = model_id
    lineage_data.timestamp = datetime.utcnow()

    # Append to lineage log
    NDJSONStorage.append(LINEAGE_FILE, lineage_data.model_dump(mode='json'))

    # Log audit event
    AuditLogger.log(
        action_type="add_lineage",
        entity_type="lineage",
        entity_id=model_id,
        model_id=model_id,
        new_value=lineage_data.model_dump(mode='json')
    )

    return {"status": "success", "message": "Lineage snapshot added"}


@router.get("/models/{model_id}/lineage", response_model=List[LineageEntry])
async def get_model_lineage(model_id: str):
    """Get all lineage snapshots for a model"""
    # Verify model exists
    model = JSONStorage.find_by_id(MODELS_FILE, "model_id", model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    # Get lineage entries
    lineage_entries = NDJSONStorage.get_all_for_model(LINEAGE_FILE, model_id, sort_by="timestamp")

    return [LineageEntry(**entry) for entry in lineage_entries]
