"""Small Flask app used to demonstrate Docker containerization and Kubernetes deployment.

Routes
  /          -> the web page (HTML, see templates/index.html)
  /api/info  -> JSON: which container/pod answered, version, environment
  /health    -> JSON: used by Docker HEALTHCHECK and Kubernetes probes
"""

import os
import socket

from flask import Flask, jsonify, render_template

app = Flask(__name__)

# The version is baked into the Docker image (see the Dockerfile build argument).
APP_VERSION = os.getenv("APP_VERSION", "1.1.0")
# The environment name comes from the Kubernetes ConfigMap (or docker-compose).
APP_ENV = os.getenv("APP_ENV", "development")


def server_info():
    """Facts about the process that is answering this request."""
    return {
        "message": "Hello from the DevOps demo app",
        "environment": APP_ENV,
        "version": APP_VERSION,
        # Inside Docker this is the container id; inside Kubernetes it is the pod name.
        # Different pods have different names, which is how we can see load balancing.
        "hostname": socket.gethostname(),
    }


@app.get("/")
def index():
    """Serve the web page. The page then calls /api/info and /health from JavaScript."""
    return render_template("index.html")


@app.get("/api/info")
def api_info():
    return jsonify(server_info())


@app.get("/health")
def health():
    return jsonify(status="ok"), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")))
