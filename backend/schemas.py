from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime

class PredictionBase(BaseModel):
    filename: str
    diagnosis: str
    confidence: float
    probabilities: Optional[Dict[str, float]] = None
    notes: Optional[str] = None

class PredictionCreate(PredictionBase):
    image_base64: str

class PredictionResponse(PredictionBase):
    id: str
    image_base64: str
    created_at: datetime

    class Config:
        from_attributes = True

class AnalyticsSummary(BaseModel):
    total_scans: int
    diagnosis_counts: Dict[str, int]
    avg_confidence: float
    recent_activity: List[PredictionResponse]
