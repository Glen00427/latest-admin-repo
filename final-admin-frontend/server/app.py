"""Lightweight Flask API that exposes the AI report analysis endpoint and serves React frontend.

The service intentionally lives under ``admin-frontend`` so that the admin
console can be deployed and iterated without depending on the driver
application's backend codebase.
"""
from __future__ import annotations

from dataclasses import asdict
from typing import Any
import os

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from .analyzer import AIReportAnalyzer

# Determine if we're running in production
IS_PRODUCTION = os.environ.get('RENDER', False)

# Create Flask app with conditional static folder
if IS_PRODUCTION:
    # In production, serve React build files
    app = Flask(__name__, static_folder='../build', static_url_path='')
else:
    # In development, no static folder needed
    app = Flask(__name__)

CORS(app)
_analyzer = AIReportAnalyzer()


@app.get("/health")
def healthcheck():
    """Return a simple readiness marker for monitoring."""
    return jsonify({"status": "ok", "engine": _analyzer._model_status})


@app.post("/ai-analysis")
def run_analysis():
    """Perform AI analysis on a supplied incident payload."""
    payload = request.get_json(silent=True) or {}
    incident = payload.get("incident")

    if incident is None:
        return (
            jsonify({"status": "error", "error": "Request body must include an 'incident' object."}),
            400,
        )

    try:
        analysis = _analyzer.analyse(incident)
    except ValueError as exc:  # validation errors from the analyzer
        return jsonify({"status": "error", "error": str(exc)}), 400
    except Exception as exc:  # unexpected errors are surfaced with minimal context
        return (
            jsonify({"status": "error", "error": "Failed to analyse incident.", "detail": str(exc)}),
            500,
        )

    # Dataclasses appear within the feature summary; normalise for JSON.
    serialised = _serialise(analysis)
    return jsonify({"status": "success", "analysis": serialised})


# Serve React App in production
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    """Serve React frontend in production."""
    if not IS_PRODUCTION:
        return jsonify({"message": "React app not available in development mode"}), 404
    
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


def _serialise(obj: Any) -> Any:
    """Recursively convert dataclass instances within nested structures."""
    if hasattr(obj, "__dataclass_fields__"):
        return {key: _serialise(value) for key, value in asdict(obj).items()}
    if isinstance(obj, dict):
        return {key: _serialise(value) for key, value in obj.items()}
    if isinstance(obj, list):
        return [_serialise(value) for value in obj]
    return obj


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
