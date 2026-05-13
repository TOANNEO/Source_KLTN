# ML Model Files

This directory contains trained machine learning models and prediction scripts.

## Files

- `model_gpa.pkl` - Regression model for GPA prediction
- `model_risk.pkl` - Classification model for risk assessment
- `predict.py` - Python script for making predictions

## Usage

```bash
# Test prediction script
echo '{"type":"gpa","study_hours":6,"sleep_duration":7}' | python predict.py
```

## Input Format

See `docs/ML_INPUT_FORMAT.md` for detailed input/output specifications.
