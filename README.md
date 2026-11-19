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
