# Docker and Kubernetes Flask App

A small Flask app that I containerize with Docker and deploy to Kubernetes.

## Run locally

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
pytest
python app.py
```

Then open http://localhost:5000

## Run with Docker

```powershell
docker build --build-arg APP_VERSION=1.1.0 -t flask-devops-demo:1.1.0 .
docker run --rm -p 5000:5000 flask-devops-demo:1.1.0
```

## Run with Docker Compose

```powershell
docker compose up --build
```
