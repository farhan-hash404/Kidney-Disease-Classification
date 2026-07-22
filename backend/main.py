import base64
from typing import List, Optional
from fastapi import FastAPI, Depends, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

try:
    from backend.database import engine, get_db, Base
    from backend.models import PredictionRecord
    from backend.schemas import PredictionResponse, AnalyticsSummary
    from backend.service import model_service
except ImportError:
    from database import engine, get_db, Base
    from models import PredictionRecord
    from schemas import PredictionResponse, AnalyticsSummary
    from service import model_service

# Create DB tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kidney Disease Classification API",
    description="FastAPI Backend for CT Scan Kidney Classification & PostgreSQL Record Management",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production can restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "online",
        "service": "Kidney Classifier AI API",
        "database": "connected"
    }

@app.post("/api/v1/predict", response_model=PredictionResponse)
async def predict_image(
    file: UploadFile = File(...),
    notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image (PNG/JPEG/DICOM).")

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty image file received.")

    # Convert image to base64 for storing in DB
    encoded_str = base64.b64encode(image_bytes).decode("utf-8")
    image_base64 = f"data:{file.content_type};base64,{encoded_str}"

    # Run AI inference
    inference_result = model_service.predict(image_bytes, filename=file.filename or "")

    # Save to PostgreSQL database
    record = PredictionRecord(
        filename=file.filename,
        image_base64=image_base64,
        diagnosis=inference_result["diagnosis"],
        confidence=inference_result["confidence"],
        probabilities=inference_result["probabilities"],
        notes=notes
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return record

@app.get("/api/v1/predictions", response_model=List[PredictionResponse])
def get_predictions(
    skip: int = 0,
    limit: int = 50,
    diagnosis: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PredictionRecord)
    if diagnosis:
        query = query.filter(PredictionRecord.diagnosis == diagnosis)
    records = query.order_by(PredictionRecord.created_at.desc()).offset(skip).limit(limit).all()
    return records

@app.get("/api/v1/predictions/{prediction_id}", response_model=PredictionResponse)
def get_prediction_by_id(prediction_id: str, db: Session = Depends(get_db)):
    record = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
    return record

@app.delete("/api/v1/predictions/{prediction_id}")
def delete_prediction(prediction_id: str, db: Session = Depends(get_db)):
    record = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
    db.delete(record)
    db.commit()
    return {"message": f"Prediction record {prediction_id} deleted successfully."}

@app.get("/api/v1/analytics", response_model=AnalyticsSummary)
def get_analytics(db: Session = Depends(get_db)):
    records = db.query(PredictionRecord).all()
    total_scans = len(records)
    
    counts = {"Normal": 0, "Kidney Tumor": 0, "Cyst": 0, "Kidney Stone": 0}
    total_conf = 0.0

    for r in records:
        if r.diagnosis in counts:
            counts[r.diagnosis] += 1
        else:
            counts[r.diagnosis] = 1
        total_conf += r.confidence

    avg_conf = round(total_conf / total_scans, 2) if total_scans > 0 else 0.0
    recent = db.query(PredictionRecord).order_by(PredictionRecord.created_at.desc()).limit(5).all()

    return AnalyticsSummary(
        total_scans=total_scans,
        diagnosis_counts=counts,
        avg_confidence=avg_conf,
        recent_activity=recent
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
