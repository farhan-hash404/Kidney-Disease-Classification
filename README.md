# Kidney Disease Classification AI System (VGG16 + FastAPI + React)

An end-to-end deep learning medical imaging project that classifies kidney CT scan images into **Normal**, **Kidney Tumor**, **Cyst**, and **Kidney Stone** findings. Built with a production-ready FastAPI backend, PostgreSQL/SQLite database persistence, VGG16 CNN inference service, and a high-performance Vite React UI.

---

## 🚀 How to Run the Application

You can launch both the **FastAPI Backend** and **React Frontend** with a single command:

```bash
python run_all.py
```

- **React Frontend UI:** [http://localhost:3000](http://localhost:3000)
- **FastAPI API Documentation (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## 🛠️ Individual Server Commands

### 1. FastAPI Backend:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 2. React Frontend (Vite + TypeScript + Tailwind CSS):
```bash
cd frontend
npm install
npm run dev
```

### 3. Build Production Bundle:
```bash
cd frontend
npm run build
```

---

## 🔬 Core Features & Architecture

1. **Classification Studio:** Drag-and-drop CT scan upload interface with real-time scan line visualizer, sample scan presets (Normal, Tumor, Stone, Cyst), and instant diagnostic breakdown.
2. **Prediction History Database:** Automatically persists diagnosis records, confidence scores, raw scan images, and clinical notes to PostgreSQL / SQLite database with filtering and search capabilities.
3. **Clinical Analytics Dashboard:** Real-time statistics, average model confidence tracking, scan distribution ratios, and diagnostic trends.
4. **Resilient AI Service:** Intelligent fallback inference engine if the trained H5 model file is not present during testing.
