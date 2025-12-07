"""Evidence packs API routes"""
import os
from typing import List
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.models.evidence_pack import EvidencePack
from app.storage.ndjson_storage import NDJSONStorage
from app.services.evidence_pack_generator import EvidencePackGenerator
from app.services.audit_logger import AuditLogger
from app.config import settings

router = APIRouter()

EVIDENCE_PACKS_FILE = os.path.join(settings.data_dir, "evidence_packs.ndjson")


@router.post("/models/{model_id}/evidence-packs", response_model=EvidencePack)
async def generate_evidence_pack(model_id: str, created_by: str = "system"):
    """Generate evidence pack for a model"""
    try:
        # Generate pack
        evidence_pack = EvidencePackGenerator.generate_evidence_pack(model_id, created_by)

        # Save metadata
        NDJSONStorage.append(EVIDENCE_PACKS_FILE, evidence_pack.model_dump(mode='json'))

        # Log audit event
        AuditLogger.log(
            action_type="generate_evidence_pack",
            entity_type="evidence_pack",
            entity_id=evidence_pack.evidence_pack_id,
            model_id=model_id,
            new_value=evidence_pack.model_dump(mode='json')
        )

        return evidence_pack

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating evidence pack: {str(e)}")


@router.get("/evidence-packs", response_model=List[EvidencePack])
async def list_evidence_packs():
    """List all evidence packs"""
    packs = NDJSONStorage.read_all(EVIDENCE_PACKS_FILE)

    # Sort by created_at descending
    packs.sort(key=lambda x: x.get('created_at', ''), reverse=True)

    return [EvidencePack(**p) for p in packs]


@router.get("/evidence-packs/{evidence_pack_id}/download")
async def download_evidence_pack(evidence_pack_id: str):
    """Download evidence pack ZIP"""
    # Find pack metadata
    packs = NDJSONStorage.filter_records(EVIDENCE_PACKS_FILE, evidence_pack_id=evidence_pack_id)

    if not packs:
        raise HTTPException(status_code=404, detail="Evidence pack not found")

    pack = packs[0]
    zip_path = pack.get('zip_path')

    if not zip_path or not os.path.exists(zip_path):
        raise HTTPException(status_code=404, detail="Evidence pack ZIP file not found")

    return FileResponse(
        path=zip_path,
        media_type='application/zip',
        filename=f"evidence_pack_{evidence_pack_id}.zip"
    )
