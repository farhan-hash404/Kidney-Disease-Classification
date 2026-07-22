@echo off
echo Starting Kidney Disease Classification FastAPI Backend...
cd backend
python -m uvicorn main:app --reload --port 8000
pause
