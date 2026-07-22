import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, JSON
try:
    from backend.database import Base
except ImportError:
    from database import Base

class PredictionRecord(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False)
    image_base64 = Column(Text, nullable=False)
    diagnosis = Column(String(50), nullable=False)  # Normal, Kidney Stone, Cyst, Kidney Tumor
    confidence = Column(Float, nullable=False)       # 0.0 - 1.0 (or percentage)
    probabilities = Column(JSON, nullable=True)     # Dictionary of class probabilities
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "image_base64": self.image_base64,
            "diagnosis": self.diagnosis,
            "confidence": self.confidence,
            "probabilities": self.probabilities,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
