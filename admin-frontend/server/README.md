# AI Analysis Backend

This is the Flask backend server that provides AI-powered incident analysis for the admin dashboard.

## Features

- Heuristic-based incident authenticity scoring
- Quality assessment of incident reports
- Red flag detection
- Automated recommendations
- Detailed reasoning and feature extraction

## Quick Start

### Prerequisites

- Python 3.7+
- pip3

### Installation

Install the required Python dependencies:

```bash
pip3 install -r requirements.txt
```

### Running the Backend

#### Option 1: Using npm scripts (from admin-frontend directory)

```bash
npm run backend        # Run in production mode
npm run backend:dev    # Run in development mode with auto-reload
```

#### Option 2: Using Flask directly (from server directory)

```bash
cd server
python3 -m flask --app app run --port 5000
```

Or with debug mode:

```bash
python3 -m flask --app app run --debug --port 5000
```

#### Option 3: Using Python directly

```bash
cd server
python3 app.py
```

The server will start on `http://localhost:5000`.

## API Endpoints

### Health Check

```
GET /health
```

Returns the status of the analyzer engine.

**Response:**
```json
{
  "status": "ok",
  "engine": {
    "ready": true,
    "message": "Heuristic scoring engine initialised inside admin-frontend."
  }
}
```

### AI Analysis

```
POST /ai-analysis
```

Analyzes an incident report and returns detailed findings.

**Request Body:**
```json
{
  "incident": {
    "description": "Roadworks seen at Woodlands Avenue 1...",
    "incidentType": "roadwork",
    "severity": "low",
    "location": "Woodlands Avenue 1",
    "createdAt": "2024-01-15T10:30:00Z",
    "photo_url": null,
    "tags": []
  }
}
```

**Response:**
```json
{
  "status": "success",
  "analysis": {
    "authenticity": {
      "score": 68,
      "label": "Needs Review",
      "signals": ["Specific details detected in description"],
      "confidence": {
        "Likely Authentic": 0.379,
        "Needs Review": 0.301,
        "Suspicious": 0.320
      }
    },
    "quality": {
      "score": 57,
      "signals": [
        "Contains concrete location cues",
        "Report is older than 24 hours"
      ]
    },
    "red_flags": [],
    "recommendation": "Hold for moderator review and request additional evidence if possible.",
    "reasoning": "No media was attached. Description length: 19 words with 2 location cues...",
    "feature_summary": {
      "description": "Roadworks seen at Woodlands Avenue 1...",
      "word_count": 19,
      "char_count": 118,
      "uncertainty_terms": 0,
      "evidence_terms": 0,
      "concrete_terms": 2,
      "has_digits": true,
      "has_photo": false,
      "severity": "low",
      "type": "roadwork",
      "location": "Woodlands Avenue 1",
      "has_tags": false,
      "has_verified_tag": false,
      "reporter_reputation": null,
      "recency_hours": 24.16
    }
  }
}
```

## Configuration

The backend uses the following configuration:

- **Port:** 5000 (default)
- **Host:** 0.0.0.0 (listens on all interfaces)
- **CORS:** Enabled for all origins

To customize the backend URL in the frontend, set the environment variable:

```bash
REACT_APP_AI_BACKEND_URL=http://localhost:5000
```

## Architecture

- **app.py**: Flask application with API endpoints
- **analyzer.py**: Core heuristic analysis engine
- **requirements.txt**: Python dependencies

## Development

The analyzer uses a rule-based system that:

1. Normalizes incident data from various sources
2. Extracts textual and metadata features
3. Scores authenticity based on multiple signals
4. Assesses report quality
5. Detects potential red flags
6. Generates actionable recommendations

No machine learning model is required - it's a pure heuristic system designed to provide fast, explainable results.
