"""Evidence pack model"""
from datetime import datetime
from typing import List
from pydantic import BaseModel, Field
import uuid


class EvidencePack(BaseModel):
    """Evidence pack metadata"""
    evidence_pack_id: str = Field(default_factory=lambda: f"pack_{uuid.uuid4().hex[:12]}")
    model_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str
    jurisdictions_covered: List[str] = Field(default_factory=list)
    included_sections: List[str] = Field(default_factory=list)
    zip_path: str = ""

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
