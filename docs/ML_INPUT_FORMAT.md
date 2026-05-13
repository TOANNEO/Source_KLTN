# ML_INPUT_FORMAT.md — Tích hợp Model Machine Learning

## Tổng quan

Model ML đã được huấn luyện trên Google Colab với dữ liệu **thang điểm hệ 4.0**, lưu thành 2 file `.pkl`.  
Backend Node.js gọi Python script → script tự quy đổi kết quả về **hệ 10** trước khi trả về.

---

## Vị trí file

```
backend/
└── ml/
    ├── gpa_scaler.pkl       # StandardScaler — chuẩn hóa dữ liệu đầu vào
    ├── gpa_model.pkl        # Regression model — dự báo GPA (output: hệ 4.0)
    └── predict.py           # Script nhận JSON input, trả JSON output (hệ 10)
```

---

## Features — Đúng thứ tự khi huấn luyện

```python
FEATURE_NAMES = [
    'final_exam_score',         # Điểm thi cuối kỳ (0–10)
    'class_attendance_percent', # Tỷ lệ đi học (0–100)
    'study_hours_per_day',      # Giờ tự học mỗi ngày
    'assignment_score',         # Điểm bài tập (0–10)
    'sleep_hours',              # Giờ ngủ mỗi ngày
    'social_media_hours',       # Giờ dùng mạng xã hội mỗi ngày
    'screen_time_hours',        # Giờ nhìn màn hình mỗi ngày
]
```

> ⚠️ **Quan trọng:** Thứ tự này phải khớp chính xác với lúc huấn luyện. Không được đổi thứ tự.

---

## Input / Output Format

### Input (JSON string qua stdin)
```json
{
  "final_exam_score": 7.5,
  "class_attendance_percent": 85.0,
  "study_hours_per_day": 5.0,
  "assignment_score": 8.0,
  "sleep_hours": 7.0,
  "social_media_hours": 2.0,
  "screen_time_hours": 3.5
}
```

### Output (JSON string ra stdout)
```json
{
  "predicted_gpa4": 2.85,
  "predicted_gpa": 7.12,
  "risk_label": "safe",
  "feature_importance": {
    "final_exam_score": 0.38,
    "class_attendance_percent": 0.22,
    "study_hours_per_day": 0.15,
    "assignment_score": 0.12,
    "sleep_hours": 0.07,
    "social_media_hours": 0.04,
    "screen_time_hours": 0.02
  }
}
```

| Field | Ý nghĩa |
|-------|---------|
| `predicted_gpa4` | GPA raw từ model, thang 4.0 — dùng để lưu DB |
| `predicted_gpa`  | GPA đã quy đổi hệ 10 — dùng để **hiển thị** cho người dùng |
| `risk_label`     | Phân loại nguy cơ dựa trên `predicted_gpa` (hệ 10) |

---

## predict.py — Script hoàn chỉnh

```python
import sys
import json
import pickle
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load 1 lần duy nhất lúc khởi động
with open(os.path.join(BASE_DIR, 'gpa_scaler.pkl'), 'rb') as f:
    scaler = pickle.load(f)

with open(os.path.join(BASE_DIR, 'gpa_model.pkl'), 'rb') as f:
    model = pickle.load(f)

# Thứ tự phải khớp chính xác với lúc huấn luyện
FEATURE_NAMES = [
    'final_exam_score',
    'class_attendance_percent',
    'study_hours_per_day',
    'assignment_score',
    'sleep_hours',
    'social_media_hours',
    'screen_time_hours',
]

def gpa4_to_gpa10(gpa4):
    """
    Quy đổi GPA hệ 4.0 → hệ 10 theo bảng quy đổi chuẩn.
    Dùng nội suy tuyến tính giữa các mốc.
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
    """Phân loại nguy cơ dựa trên GPA hệ 10."""
    if gpa10 >= 6.0:
        return 'safe'
    elif gpa10 >= 5.0:
        return 'warning'
    else:
        return 'danger'

def get_feature_importance():
    importance = {}
    if hasattr(model, 'feature_importances_'):
        for name, imp in zip(FEATURE_NAMES, model.feature_importances_):
            importance[name] = round(float(imp), 4)
    elif hasattr(model, 'coef_'):
        total = sum(abs(c) for c in model.coef_.flatten())
        for name, coef in zip(FEATURE_NAMES, model.coef_.flatten()):
            importance[name] = round(abs(float(coef)) / total, 4) if total > 0 else 0
    return importance

def predict(input_data):
    raw_features = np.array([[input_data[f] for f in FEATURE_NAMES]])
    scaled_features = scaler.transform(raw_features)

    # Model trả về GPA hệ 4.0
    predicted_gpa4 = float(model.predict(scaled_features)[0])
    predicted_gpa4 = round(max(0.0, min(4.0, predicted_gpa4)), 2)

    # Quy đổi về hệ 10 để hiển thị và phân loại nguy cơ
    predicted_gpa10 = gpa4_to_gpa10(predicted_gpa4)

    return {
        'predicted_gpa4': predicted_gpa4,   # Lưu vào DB
        'predicted_gpa':  predicted_gpa10,  # Hiển thị cho người dùng
        'risk_label':     classify_risk(predicted_gpa10),
        'feature_importance': get_feature_importance()
    }

if __name__ == '__main__':
    try:
        input_data = json.loads(sys.stdin.read())
        result = predict(input_data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)
```

---

## Bảng quy đổi GPA 4.0 → 10

| Hệ 4.0 | Hệ 10 | Xếp loại |
|--------|-------|----------|
| 3.7 – 4.0 | 9.0 – 10.0 | Xuất sắc |
| 3.5 – 3.69 | 8.5 – 8.9 | Giỏi |
| 3.2 – 3.49 | 8.0 – 8.4 | Giỏi |
| 3.0 – 3.19 | 7.5 – 7.9 | Khá |
| 2.8 – 2.99 | 7.0 – 7.4 | Khá |
| 2.5 – 2.79 | 6.5 – 6.9 | Khá |
| 2.3 – 2.49 | 6.0 – 6.4 | Trung bình khá |
| 2.0 – 2.29 | 5.5 – 5.9 | Trung bình |
| 1.7 – 1.99 | 5.0 – 5.4 | Trung bình |
| 1.5 – 1.69 | 4.5 – 4.9 | Yếu |
| 1.3 – 1.49 | 4.0 – 4.4 | Yếu |
| < 1.3 | < 4.0 | Kém |

---

## Risk Label Mapping (dựa trên hệ 10)

| risk_label | Màu | GPA hệ 10 |
|------------|-----|-----------|
| `safe`    | 🟢 Xanh | ≥ 6.0 |
| `warning` | 🟡 Vàng | 5.0 – 5.99 |
| `danger`  | 🔴 Đỏ   | < 5.0 |

---

## mlService.js — Node.js gọi predict.py

```javascript
// backend/src/services/mlService.js
const { spawn } = require('child_process');
const path = require('path');

const SCRIPT_PATH = path.join(__dirname, '../../ml/predict.py');
const PYTHON_PATH = process.env.PYTHON_PATH || 'python3';
const TIMEOUT_MS = 30000;

async function runPrediction(behaviorData, gradeData) {
  const inputPayload = {
    final_exam_score:           gradeData.middle_exam_score     ?? 0,
    class_attendance_percent:   behaviorData.class_attendance    ?? 0,
    study_hours_per_day:        behaviorData.study_hours_per_day ?? 0,
    assignment_score:           gradeData.assignment_score       ?? 0,
    sleep_hours:                behaviorData.sleep_hours_per_day ?? 7,
    social_media_hours:         behaviorData.social_media_hours  ?? 0,
    screen_time_hours:          behaviorData.screen_time_hours   ?? 0,
  };

  return new Promise((resolve, reject) => {
    const proc = spawn(PYTHON_PATH, [SCRIPT_PATH]);
    let output = '';
    let errorOutput = '';

    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error('ML prediction timeout (30s)'));
    }, TIMEOUT_MS);

    proc.stdout.on('data', (data) => { output += data.toString(); });
    proc.stderr.on('data', (data) => { errorOutput += data.toString(); });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error(`Python exited ${code}: ${errorOutput}`));
      try {
        const result = JSON.parse(output);
        if (result.error) return reject(new Error(result.error));
        resolve(result);
        // result.predicted_gpa4 → lưu vào prediction_history (hệ 4.0)
        // result.predicted_gpa  → hiển thị cho sinh viên (hệ 10)
        // result.risk_label     → 'safe' | 'warning' | 'danger'
      } catch {
        reject(new Error('Invalid JSON from Python script'));
      }
    });

    proc.stdin.write(JSON.stringify(inputPayload));
    proc.stdin.end();
  });
}

module.exports = { runPrediction };
```

---

## Test thủ công

```bash
cd backend/ml
echo '{
  "final_exam_score": 7.5,
  "class_attendance_percent": 85,
  "study_hours_per_day": 5,
  "assignment_score": 8,
  "sleep_hours": 7,
  "social_media_hours": 2,
  "screen_time_hours": 3.5
}' | python3 predict.py

# Output mong đợi:
# {"predicted_gpa4": 2.85, "predicted_gpa": 7.12, "risk_label": "safe", "feature_importance": {...}}
```

---

## Lưu ý quan trọng

1. `gpa_scaler.pkl` phải là **đúng scaler đã fit trên training data** — không được fit lại với dữ liệu mới
2. Model output hệ 4.0 → `predict.py` tự quy đổi sang hệ 10 bằng `gpa4_to_gpa10()` trước khi trả về Node.js
3. Lưu cả 2 giá trị vào bảng `prediction_history`: `predicted_gpa` (hệ 10) và `predicted_gpa4` (hệ 4.0)
4. Dependencies Python cần cài: `pip install scikit-learn numpy`

