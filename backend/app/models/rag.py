"""RAG evaluation model for insurance copilots"""
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class RAGEvaluationMethod(str, Enum):
    """RAG evaluation methods"""
    HUMAN_LABELING = "human_labeling"
    LLM_JUDGE = "LLM_judge"


class RAGEvaluation(BaseModel):
    """RAG evaluation for insurance copilots"""
    model_id: str
    eval_batch_id: str
    grounding_score: float = Field(ge=0, le=1)
    hallucination_rate: float = Field(ge=0, le=1)
    context_relevance_score: float = Field(ge=0, le=1)
    method: RAGEvaluationMethod
    summary: str
    notes: str = ""
    coverage_misstatement_flag: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
