#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ML Prediction Script
Receives JSON input via stdin, returns JSON output via stdout
Model trained on GPA 4.0 scale, converts to 10.0 scale for display
"""
import sys
import json
import pickle
import numpy as np
import os
import shap

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Feature names in exact order used during training
FEATURE_NAMES = [
    'study_hours_per_day',
    'class_attendance_percent',
    'sleep_hours',
    'mental_stress_level',
    'social_media_hours',
    'screen_time_hours',
    'extracurricular_hours_per_week',
    'exercise_hours_per_week'
]

def load_models():
    """Load trained ML models"""
    try:
        scaler_path = os.path.join(BASE_DIR, 'scaler_intervention.pkl')
        model_path = os.path.join(BASE_DIR, 'lr_model_intervention.pkl')

        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)

        with open(model_path, 'rb') as f:
            model = pickle.load(f)

        return scaler, model
    except FileNotFoundError as e:
        raise Exception(f"Model files not found: {e}")

def gpa4_to_gpa10(gpa4):
    """
    Convert GPA from 4.0 scale to 10.0 scale
    Uses linear interpolation between standard conversion points
    """
    scale = [
        (4.0, 10.0), (3.7, 9.0), (3.5, 8.5), (3.2, 8.0),
        (3.0, 7.5),  (2.8, 7.0), (2.5, 6.5), (2.3, 6.0),
        (2.0, 5.5),  (1.7, 5.0), (1.5, 4.5), (1.3, 4.0),
        (0.0, 0.0),
    ]
    gpa4 = max(0.0, min(4.0, gpa4))

    for i in range(len(scale) - 1):
        g4_hi, g10_hi = scale[i]
        g4_lo, g10_lo = scale[i + 1]
        if gpa4 >= g4_lo:
            ratio = (gpa4 - g4_lo) / (g4_hi - g4_lo) if g4_hi != g4_lo else 1
            return round(g10_lo + ratio * (g10_hi - g10_lo), 2)
    return 0.0

def classify_risk(gpa10):
    """Classify risk level based on GPA 10.0 scale"""
    if gpa10 >= 7.0:
        return 'safe'
    elif gpa10 >= 5.0:
        return 'warning'
    else:
        return 'danger'

def get_feature_importance(model, scaled_features):
    # """Extract feature importance from model"""
    # importance = {}

    # if hasattr(model, 'feature_importances_'):
    #     # Tree-based models
    #     for name, imp in zip(FEATURE_NAMES, model.feature_importances_):
    #         importance[name] = round(float(imp), 4)
    # elif hasattr(model, 'coef_'):
    #     # Linear models
    #     total = sum(abs(c) for c in model.coef_.flatten())
    #     for name, coef in zip(FEATURE_NAMES, model.coef_.flatten()):
    #         importance[name] = round(abs(float(coef)) / total, 4) if total > 0 else 0
    # else:
    #     # Default equal importance
    #     for name in FEATURE_NAMES:
    #         importance[name] = round(1.0 / len(FEATURE_NAMES), 4)

    # return importance
    """
    Sử dụng SHAP để tính toán đóng góp cục bộ (Local Impact) cho riêng sinh viên này.
    Trả về giá trị điểm số đóng góp (+ hoặc -) vào GPA hệ 4.0.
    """
    importance = {}
    try:
        # Vì dữ liệu đầu vào đã được chuẩn hóa (scaled), điểm trung bình của toàn khóa
        # sẽ tương ứng với một mảng các số 0. Chúng ta dùng nó làm dữ liệu nền (background data).
        background = np.zeros((1, len(FEATURE_NAMES)))
        
        # Sử dụng LinearExplainer tối ưu riêng cho mô hình Tuyến tính (Linear Regression)
        explainer = shap.LinearExplainer(model, background)
        
        # Tính toán SHAP values cho dòng dữ liệu của sinh viên hiện tại
        shap_values = explainer.shap_values(scaled_features)
        
        # Lấy dòng đầu tiên [0] vì hệ thống chỉ nhận input của 1 sinh viên tại một thời điểm
        student_shap = shap_values[0]
        
        for name, shap_val in zip(FEATURE_NAMES, student_shap):
            importance[name] = round(float(shap_val), 4)
            
    except Exception as e:
        # Cơ chế dự phòng nếu xảy ra lỗi thư viện: Chia đều độ quan trọng
        for name in FEATURE_NAMES:
            importance[name] = round(1.0 / len(FEATURE_NAMES), 4)
            
    return importance

def predict(input_data):
    """Main prediction function"""
    # Load models
    scaler, model = load_models()

    # Prepare features in correct order
    raw_features = np.array([[input_data[f] for f in FEATURE_NAMES]])

    # Scale features
    scaled_features = scaler.transform(raw_features)

    # Predict GPA on 4.0 scale
    predicted_gpa4 = float(model.predict(scaled_features)[0])
    predicted_gpa4 = round(max(0.0, min(4.0, predicted_gpa4)), 2)

    # Convert to 10.0 scale for display
    predicted_gpa10 = gpa4_to_gpa10(predicted_gpa4)

    # Classify risk
    risk_label = classify_risk(predicted_gpa10)

    # Get feature importance
    feature_importance = get_feature_importance(model, scaled_features)

    return {
        'predicted_gpa4': predicted_gpa4,      # Save to DB (4.0 scale)
        'predicted_gpa': predicted_gpa10,      # Display to user (10.0 scale)
        'risk_label': risk_label,              # safe/warning/danger
        'feature_importance': feature_importance
    }

def main():
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())

        # Validate required fields
        for field in FEATURE_NAMES:
            if field not in input_data:
                raise ValueError(f"Missing required field: {field}")

        # Run prediction
        result = predict(input_data)

        # Output result as JSON to stdout
        print(json.dumps(result))

    except Exception as e:
        # Output error to stderr
        error_result = {'error': str(e)}
        print(json.dumps(error_result), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
