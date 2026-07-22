FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV and psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/backend_requirements.txt
RUN pip install --no-cache-dir -r /app/backend_requirements.txt

COPY backend /app/backend
COPY src /app/src
COPY config /app/config
COPY params.yaml /app/params.yaml

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
