# Kidney Disease Classification — Deep Learning MLOps Project

An end-to-end deep learning project that classifies kidney CT scan images as **Normal** or **Tumor**, built with a production-grade MLOps pipeline from data ingestion to cloud deployment.

##  Problem Statement
Kidney tumors are abnormal growths that can occur unexpectedly and may be benign or cancerous. This project uses a CNN-based image classifier (VGG16 transfer learning) to automatically classify kidney CT scan images, assisting in early detection workflows.

##  Key Features
- **Modular architecture** — config-driven design using entity/config/components/pipeline structure for maintainability and reusability
- **Transfer learning** — fine-tuned VGG16 (pretrained on ImageNet) with custom classification head
- **Experiment tracking** — MLflow integration (via DagsHub) for logging parameters, metrics, and model versioning/registry
- **Pipeline versioning** — DVC (Data Version Control) to track pipeline stages and avoid redundant re-execution
- **Data ingestion** — automated data download from Google Drive
- **Web application** — Flask-based UI for training and real-time prediction
- **Containerization** — Dockerized application for consistent deployment
- **CI/CD** — automated build, push, and deployment pipeline using GitHub Actions with a self-hosted EC2 runner, deployed to AWS (ECR + EC2)

##  Tech Stack
`Python` `TensorFlow/Keras` `MLflow` `DVC` `Flask` `Docker` `GitHub Actions` `AWS (ECR, EC2, IAM)` `DagsHub`

##  Project Structure
- `src/` — modular source code (components, config, entity, pipeline, utils)
- `config/` — configuration YAML files
- `params.yaml` — model hyperparameters
- `dvc.yaml` — DVC pipeline definition
- `Dockerfile` — container build spec
- `.github/workflows/` — CI/CD pipeline definitions
- `app.py` — Flask application entry point

##  Workflow
1. Data Ingestion → 2. Base Model Preparation → 3. Model Training → 4. Model Evaluation (with MLflow logging) → 5. Deployment

## 🔗 Live Demo / Deployment
Deployed on AWS EC2 using Docker containers pulled from Amazon ECR, with automated CI/CD triggered on every push to `main`.
