# 🩺 KidneyVision AI — Deep Learning & CT Radiomics Diagnostic Platform

[![Python Version](https://img.shields.io/badge/python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3+-646CFF.svg)](https://vitejs.dev/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-FF6F00.svg)](https://tensorflow.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38BDF8.svg)](https://tailwindcss.com/)

An end-to-end medical AI diagnostic system that classifies kidney CT scan images into four distinct clinical categories: **Normal**, **Kidney Tumor**, **Cyst**, and **Kidney Stone**. Built with a fine-tuned VGG16 deep neural network, background-masked CT radiomic feature analysis, a high-performance FastAPI backend, and a modern Vite + React UI.

---

## ✨ Key Features

- 🔬 **4-Class Multi-Class Diagnostics:** Accurate differentiation across **Normal**, **Kidney Tumor**, **Cyst**, and **Kidney Stone** CT scans.
- 🎯 **Dual Inference Engine:** Fine-tuned VGG16 Deep Convolutional Neural Network backed by ROI-masked radiomic feature scoring (calcification spikes $>210$, hypo-dense fluid voids $<60$, and edge gradient variance).
- ⚡ **Production FastAPI Backend:** High-speed RESTful API equipped with Pydantic v2 data validation and SQLAlchemy 2.0 ORM.
- 🎨 **Modern React UI:** Dark-mode glassmorphic clinical studio with interactive CT scan line visualizers, drag-and-drop uploads, preset sample CT scans, and probability distribution meters.
- 📊 **Clinical History & Analytics Dashboard:** Automatic persistence of scan records, confidence scores, and notes to PostgreSQL/SQLite database with full-text search, filtering, and record deletion.
- 🚀 **Unified Launcher:** One-command execution system (`python run_all.py`) that launches both backend and frontend servers simultaneously.

---

## 🏗️ Project Architecture

```text
Kidney-Disease-Classification/
├── backend/                  # FastAPI REST API & Database Service
│   ├── database.py           # SQLAlchemy Engine & Session Setup
│   ├── main.py               # API Routes & Health Endpoints
│   ├── models.py             # Database Models (PredictionRecord)
│   ├── schemas.py            # Pydantic Schemas for Requests & Responses
│   └── service.py            # Model Inference & CT Radiomics Engine
├── frontend/                 # Vite + React + TypeScript + Tailwind CSS UI
│   ├── src/
│   │   ├── App.tsx           # Main Clinical Studio & Dashboard UI
│   │   ├── index.css         # Glassmorphism & Custom CSS Styles
│   │   ├── lib/api.ts        # Frontend REST API Client
│   │   └── main.tsx          # React Entry Point
│   ├── index.html            # Web Application Entry HTML
│   ├── package.json          # Node Dependencies & Build Scripts
│   └── vite.config.ts        # Vite Proxy & Build Configuration
├── src/cnnClassifier/        # Modular ML Pipeline Package
│   ├── components/           # Ingestion, Base Model, & Training Modules
│   ├── config/               # Configuration Management
│   ├── entity/               # Data Classes & Schemas
│   └── utils/                # Common Helper Functions
├── config/config.yaml        # Data & Model Pipeline Directories
├── params.yaml               # Hyperparameters (CLASSES: 4, LR: 0.01, VGG16)
├── dvc.yaml                  # DVC Reproducible Pipeline Stages
├── run_all.py                # Single-Command System Launcher
└── requirements.txt          # Python Package Dependencies
```

---

## ⚡ Quick Start

### Option 1: Unified Launcher (Recommended)

Run the single-command launcher from the project root:

```bash
python run_all.py
```

This automatically starts both servers:
- 🖥️ **React Frontend UI:** `http://localhost:3000`
- ⚙️ **FastAPI Swagger API Docs:** `http://localhost:8000/docs`
- 🏥 **API Health Check:** `http://localhost:8000/api/v1/health`

---

### Option 2: Run Backend & Frontend Separately

#### 1. Start the FastAPI Backend:
```bash
# Navigate to backend directory
cd backend

# Install Python requirements
pip install -r requirements.txt

# Start Uvicorn dev server
python -m uvicorn main:app --reload --port 8000
```

#### 2. Start the React Frontend:
```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health status check |
| `POST` | `/api/v1/predict` | Upload CT scan image for 4-class classification |
| `GET` | `/api/v1/predictions` | Retrieve diagnostic history with optional diagnosis filtering |
| `GET` | `/api/v1/predictions/{id}` | Fetch detailed prediction record by ID |
| `DELETE` | `/api/v1/predictions/{id}` | Delete a specific prediction record |
| `GET` | `/api/v1/analytics` | Fetch clinical summary statistics and prevalence breakdown |

---

## 🔬 Radiomic CT Feature Detection

| Finding | Radiomic & Dense Feature Criteria |
| :--- | :--- |
| **Normal** | Homogeneous kidney parenchymal tissue ($60 \le \text{ROI} < 110$) without calcification spikes. |
| **Kidney Tumor** | Soft-tissue mass concentration ($110 \le \text{ROI} < 195$) with high Sobel gradient margin variance. |
| **Cyst** | Hypo-dense fluid-filled void structures ($15 \le \text{ROI} < 60$) within ROI tissue. |
| **Kidney Stone** | Hyper-dense calcification spikes ($\text{ROI} > 210$) and max brightness peaks. |

---

## 🛡️ License & Acknowledgments

Built for deep learning diagnostic workflows using TensorFlow, FastAPI, and React.
