"""Governance philosophy API routes"""
import os
from typing import List, Optional
from fastapi import APIRouter, Query

from app.models.philosophy import GovernancePhilosophy, PhilosophyScope
from app.storage.ndjson_storage import NDJSONStorage
from app.services.philosophy_llm import PhilosophyLLMService
from app.services.audit_logger import AuditLogger
from app.config import settings

router = APIRouter()

PHILOSOPHY_FILE = os.path.join(settings.data_dir, "governance_philosophy.ndjson")


@router.post("/governance/philosophy", response_model=GovernancePhilosophy)
async def create_or_update_philosophy(
    philosophy: GovernancePhilosophy,
    use_llm_to_fill_gaps: bool = Query(False)
):
    """Create or update governance philosophy"""
    # Use LLM to fill gaps if requested
    if use_llm_to_fill_gaps:
        philosophy = PhilosophyLLMService.fill_philosophy_gaps(philosophy)

    # Append to philosophy log
    NDJSONStorage.append(PHILOSOPHY_FILE, philosophy.model_dump(mode='json'))

    # Log audit event
    AuditLogger.log(
        action_type="create_philosophy",
        entity_type="philosophy",
        entity_id=f"{philosophy.scope}_{philosophy.scope_ref}",
        new_value=philosophy.model_dump(mode='json')
    )

    return philosophy


@router.get("/governance/philosophy", response_model=List[GovernancePhilosophy])
async def get_philosophy(
    scope: Optional[PhilosophyScope] = Query(None),
    scope_ref: Optional[str] = Query(None)
):
    """Get governance philosophy entries"""
    all_philosophies = NDJSONStorage.read_all(PHILOSOPHY_FILE)

    # Apply filters
    if scope:
        all_philosophies = [p for p in all_philosophies if p.get('scope') == scope.value]

    if scope_ref:
        all_philosophies = [p for p in all_philosophies if p.get('scope_ref') == scope_ref]

    # Sort by updated_at descending
    all_philosophies.sort(key=lambda x: x.get('updated_at', ''), reverse=True)

    return [GovernancePhilosophy(**p) for p in all_philosophies]
