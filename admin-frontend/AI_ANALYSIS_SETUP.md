# AI Analysis Feature Setup Guide

This guide explains how to set up and use the AI Analysis feature for incident reports.

## Overview

The AI Analysis feature provides automated assessment of incident reports, including:
- **Authenticity scoring** (0-100%) with confidence breakdown
- **Quality scoring** (0-100%) with specific observations
- **Red flag detection** for suspicious reports
- **Automated recommendations** for moderators
- **Detailed reasoning** explaining the analysis
- **Feature summary** showing all signals considered

## Architecture

The system consists of two parts:

1. **Frontend (React)**: Displays the AI analysis in a modal dialog
2. **Backend (Flask)**: Python server that performs the heuristic analysis

```
admin-frontend/
├── src/
│   └── components/
│       ├── IncidentsTab.js        # Contains "AI Analysis" button
│       └── AIAnalysisModal.js     # Displays analysis results
└── server/
    ├── app.py                      # Flask API server
    ├── analyzer.py                 # Core analysis engine
    └── requirements.txt            # Python dependencies
```

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd admin-frontend
pip3 install -r server/requirements.txt
```

This installs:
- Flask 3.0.0
- Flask-CORS 4.0.0

### 2. Start the Backend Server

Open a terminal and run:

```bash
cd admin-frontend
npm run backend
```

Or for development mode with auto-reload:

```bash
npm run backend:dev
```

The backend will start on `http://localhost:5000`.

You should see output like:
```
 * Running on http://0.0.0.0:5000
```

### 3. Start the Frontend

Open a **new terminal** and run:

```bash
cd admin-frontend
npm start
```

The frontend will start on `http://localhost:3000`.

### 4. Using the AI Analysis Feature

1. Navigate to the **Incidents** tab in the admin dashboard
2. Find any incident card and click the **"AI Analysis"** button
3. A modal will appear with the AI-generated analysis
4. The analysis includes:
   - Authenticity and quality scores
   - Confidence breakdown (Likely Authentic / Needs Review / Suspicious)
   - Red flags (if any detected)
   - Quality observations
   - Recommendation for moderators
   - Detailed reasoning
   - All signals considered

## Configuration

### Backend URL

By default, the frontend connects to `http://localhost:5000`.

To use a different backend URL, create a `.env` file in `admin-frontend/`:

```env
REACT_APP_AI_BACKEND_URL=http://your-backend-url:5000
```

## Troubleshooting

### Backend not connecting

**Error message:** "Unable to connect to AI service"

**Solutions:**
1. Ensure the backend server is running on port 5000
2. Check if port 5000 is already in use: `lsof -i :5000`
3. Verify Flask is installed: `python3 -c "import flask; print('OK')"`
4. Check backend logs for errors

### Import errors in backend

**Error:** `ImportError: No module named 'flask'`

**Solution:**
```bash
pip3 install -r server/requirements.txt
```

### CORS errors

**Error:** "Access to fetch at '...' from origin '...' has been blocked by CORS policy"

**Solution:**
The backend has CORS enabled by default. If issues persist, check that the backend is running and accessible.

### Port 5000 already in use

**Error:** `Address already in use`

**Solution:**
1. Find the process using port 5000: `lsof -i :5000`
2. Kill the process: `kill -9 <PID>`
3. Or use a different port and update `REACT_APP_AI_BACKEND_URL`

## API Reference

### Health Check

```bash
curl http://localhost:5000/health
```

### Analyze an Incident

```bash
curl -X POST http://localhost:5000/ai-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "incident": {
      "description": "Accident on PIE near Simei exit",
      "incidentType": "accident",
      "severity": "high",
      "location": "PIE",
      "photo_url": "https://example.com/photo.jpg"
    }
  }'
```

## How the Analysis Works

The analyzer uses a **heuristic-based scoring system** (no machine learning required) that:

1. **Normalizes** the incident data to handle different field names
2. **Extracts features** including:
   - Word count and character count
   - Uncertainty terms ("maybe", "not sure", etc.)
   - Concrete location details
   - Presence of media
   - Severity level
   - Report recency
   - Reporter reputation (if available)

3. **Scores authenticity** based on:
   - Photo evidence (+12 points)
   - Specific details (+10 points)
   - Uncertainty language (up to -18 points)
   - Severity vs context mismatch (-10 points)
   - Reporter reputation (±5-7 points)

4. **Scores quality** based on:
   - Description length
   - Concrete location cues
   - Photo evidence
   - Report recency
   - Uncertainty language

5. **Detects red flags** such as:
   - Multiple uncertainty phrases
   - High severity with minimal description
   - Severe incident without media
   - Low reporter reputation

6. **Generates recommendations** such as:
   - "Approve and publish" (high confidence)
   - "Hold for moderator review"
   - "Escalate for manual verification"

## Development Tips

### Testing the Backend

Test the backend independently:

```bash
cd admin-frontend/server
python3 -c "from app import app; from analyzer import AIReportAnalyzer; print('✓ Backend OK')"
```

### Modifying the Analysis Logic

Edit `server/analyzer.py` to adjust:
- Scoring weights (lines 226-293)
- Red flag detection (lines 340-360)
- Recommendation logic (lines 363-375)

After making changes, restart the backend server.

### Viewing API Responses

Open browser DevTools → Network tab → Filter by "ai-analysis" to see the full API response.

## Production Deployment

For production deployment:

1. **Backend**: Deploy the Flask server behind a reverse proxy (nginx, Apache)
2. **Environment**: Set `REACT_APP_AI_BACKEND_URL` to your production backend URL
3. **Security**: Consider adding authentication to the `/ai-analysis` endpoint
4. **Scaling**: The analyzer is stateless and can be horizontally scaled

## Support

For issues or questions:
1. Check the backend logs for errors
2. Verify the incident data structure matches the expected format
3. Review `server/analyzer.py` for analysis logic details
