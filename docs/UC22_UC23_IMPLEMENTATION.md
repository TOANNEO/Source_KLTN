# UC22 & UC23 Implementation Guide

## Overview

This document describes the implementation of:
- **UC22**: Thống kê sinh viên nguy cơ (At-Risk Students Statistics)
- **UC23**: Báo cáo hiệu quả cải thiện (Improvement Effectiveness Report)

## UC22: At-Risk Students Statistics

### API Endpoint

```
GET /api/v1/lecturer/at-risk-students
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `semester_id` | integer | No | Filter by semester |
| `predicted_gpa_threshold` | float (0-10) | No | Show students with GPA <= threshold |
| `stress_level` | integer (0-10) | No | Show students with stress >= level |

### Request Example

```bash
curl -X GET "http://localhost:5000/api/v1/lecturer/at-risk-students?semester_id=1&predicted_gpa_threshold=6.0&stress_level=7" \
  -H "Authorization: Bearer <LECTURER_TOKEN>"
```

### Response Format

```json
{
  "success": true,
  "data": {
    "total": 15,
    "students": [
      {
        "student_id": 1,
        "student_code": "A46644",
        "full_name": "Nguyễn Văn A",
        "email": "student1@tlu.edu.vn",
        "major": "Công nghệ thông tin",
        "course_year": 2022,
        "current_gpa": 6.5,
        "predicted_gpa": 5.8,
        "predicted_gpa4": 2.32,
        "risk_label": "warning",
        "risk_score": 0.65,
        "stress_level": 8,
        "semester": {
          "id": 1,
          "name": "HK1 2024-2025",
          "academic_year": "2024-2025"
        },
        "predicted_at": "2024-12-15T10:30:00.000Z"
      }
    ]
  },
  "message": "Tìm thấy 15 sinh viên nguy cơ"
}
```

### Risk Labels

- `danger`: GPA < 5.0 (red)
- `warning`: GPA 5.0-6.9 (yellow)
- `safe`: GPA >= 7.0 (green)

### Sorting Logic

Students are sorted by:
1. Risk level (danger > warning > safe)
2. Predicted GPA (ascending)

### Edge Cases

- **No predictions**: Returns empty array with message "Không có sinh viên nguy cơ theo tiêu chí lọc"
- **No behavior data**: `stress_level` will be `null`
- **Invalid filters**: Returns 400 with validation error

---

## Student Detail Report

### API Endpoint

```
GET /api/v1/lecturer/students/:id/report
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Student ID |

### Request Example

```bash
curl -X GET "http://localhost:5000/api/v1/lecturer/students/1/report" \
  -H "Authorization: Bearer <LECTURER_TOKEN>"
```

### Response Format

```json
{
  "success": true,
  "data": {
    "student_info": {
      "id": 1,
      "student_code": "A46644",
      "full_name": "Nguyễn Văn A",
      "email": "student1@tlu.edu.vn",
      "major": "Công nghệ thông tin",
      "course_year": 2022,
      "total_credits": 60,
      "gpa_cumulative": 6.5
    },
    "grades": [
      {
        "id": 1,
        "course_code": "CTDLGT",
        "course_name": "Cấu trúc dữ liệu và giải thuật",
        "credits": 3,
        "midterm_score": 7.5,
        "final_score": 8.0,
        "total_score": 7.85,
        "is_improvement": 0,
        "semester": {
          "id": 1,
          "name": "HK1 2024-2025"
        }
      }
    ],
    "predictions": [
      {
        "id": 1,
        "predicted_gpa": 5.8,
        "predicted_gpa4": 2.32,
        "risk_label": "warning",
        "risk_score": 0.65,
        "semester": {
          "id": 1,
          "name": "HK1 2024-2025"
        },
        "predicted_at": "2024-12-15T10:30:00.000Z"
      }
    ],
    "behavior_records": [
      {
        "id": 1,
        "study_hours_per_day": 5.0,
        "sleep_hours_per_day": 7.0,
        "class_attendance": 85.0,
        "social_media_hours": 3.0,
        "screen_time_hours": 5.0,
        "mental_stress_level": 8,
        "semester": {
          "id": 1,
          "name": "HK1 2024-2025"
        }
      }
    ]
  }
}
```

---

## UC23: Improvement Effectiveness Report

### API Endpoint

```
GET /api/v1/lecturer/improvement-report
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `semester_id` | integer | No | Filter by semester |
| `student_id` | integer | No | Filter by specific student |

### Request Example

```bash
curl -X GET "http://localhost:5000/api/v1/lecturer/improvement-report?semester_id=1" \
  -H "Authorization: Bearer <LECTURER_TOKEN>"
```

### Response Format

```json
{
  "success": true,
  "data": {
    "summary": {
      "total_students": 5,
      "total_improvements": 12,
      "average_score_gain": 1.85,
      "average_gpa_gain": 0.15
    },
    "improvements": [
      {
        "student_id": 1,
        "student_code": "A46644",
        "full_name": "Nguyễn Văn A",
        "course_code": "CTDLGT",
        "course_name": "Cấu trúc dữ liệu và giải thuật",
        "credits": 3,
        "old_score": 5.2,
        "improved_score": 7.5,
        "score_gain": 2.3,
        "actual_gpa_gain": 0.12,
        "semester": {
          "id": 1,
          "name": "HK1 2024-2025"
        },
        "improvement_date": "2024-12-10T08:00:00.000Z"
      }
    ]
  },
  "message": "Tìm thấy 12 bản ghi cải thiện"
}
```

### GPA Gain Calculation

Formula used:
```
gpa_gain = (new_score - old_score) × credits / total_credits
```

Where:
- `new_score`: Improved score
- `old_score`: Original score
- `credits`: Course credits
- `total_credits`: Student's total accumulated credits

### Sorting Logic

Improvements are sorted by `actual_gpa_gain` (descending) to show most impactful improvements first.

### Edge Cases

- **No improvement records**: Returns empty array with message "Chưa có dữ liệu cải thiện"
- **Student not found**: Returns 404 error
- **No matching filters**: Returns empty improvements array

---

## Export Reports

### API Endpoint

```
POST /api/v1/lecturer/reports/export
```

### Request Body

```json
{
  "report_type": "at-risk",
  "format": "excel",
  "filters": {
    "semester_id": 1,
    "predicted_gpa_threshold": 6.0
  }
}
```

### Parameters

| Parameter | Type | Required | Values | Description |
|-----------|------|----------|--------|-------------|
| `report_type` | string | Yes | `at-risk`, `improvement` | Type of report |
| `format` | string | Yes | `excel`, `pdf` | Export format |
| `filters` | object | No | - | Same filters as GET endpoints |

### Response Format

```json
{
  "success": true,
  "message": "Export EXCEL - Coming soon",
  "data": {
    "filename": "at-risk-students-1702645200000.excel",
    "record_count": 15
  }
}
```

### Implementation Status

- ✅ Data retrieval and filtering
- ⏳ Excel export (TODO: implement with `xlsx` library)
- ⏳ PDF export (TODO: implement with `pdfkit` library)

---

## Service Layer Implementation

### File: `backend/src/services/lecturerService.js`

#### Key Functions

1. **getAtRiskStudents(filters)**
   - Queries `PredictionHistory` with joins to `Student`, `BehaviorRecord`, `Semester`
   - Applies filters for semester, GPA threshold, stress level
   - Returns formatted array sorted by risk level

2. **getStudentDetailReport(studentId)**
   - Fetches complete student profile
   - Includes grades, predictions (last 5), behavior records
   - Returns comprehensive student data

3. **getImprovementReport(filters)**
   - Finds all improvement records (`is_improvement = 1`)
   - Calculates GPA gain for each improvement
   - Returns summary statistics and detailed improvements

### Database Queries

All queries use Sequelize ORM with:
- Eager loading (includes) to avoid N+1 queries
- Proper indexing on foreign keys
- Filtering at database level for performance

---

## Controller Layer Implementation

### File: `backend/src/controllers/lecturerController.js`

#### Endpoints Implemented

1. `getDashboard()` - Lecturer dashboard overview
2. `getAtRiskStudents()` - UC22 main endpoint
3. `getStudentReport()` - Student detail view
4. `getImprovementReport()` - UC23 main endpoint
5. `exportReport()` - Export functionality

### Error Handling

All controllers include:
- Try-catch blocks
- Appropriate HTTP status codes (404, 500)
- Vietnamese error messages
- Console logging for debugging

---

## Routes Implementation

### File: `backend/src/routes/lecturer.routes.js`

### Middleware Stack

1. `authenticateToken` - Verify JWT token
2. `requireRole('lecturer')` - Ensure lecturer role
3. `express-validator` - Validate query/body parameters
4. `handleValidationErrors` - Return validation errors

### Validation Rules

- `semester_id`: Optional integer
- `predicted_gpa_threshold`: Optional float (0-10)
- `stress_level`: Optional integer (0-10)
- `student_id`: Required integer for detail endpoint
- `report_type`: Must be 'at-risk' or 'improvement'
- `format`: Must be 'excel' or 'pdf'

---

## Testing Guide

### Prerequisites

1. Create lecturer account:
```sql
INSERT INTO users (email, password, role, first_name, last_name)
VALUES ('lecturer@tlu.edu.vn', '<BCRYPT_HASH>', 'lecturer', 'Test', 'Lecturer');

INSERT INTO lecturers (user_id, lecturer_code, degree, department_id)
VALUES (LAST_INSERT_ID(), 'GV001', 'Tiến sĩ', 1);
```

2. Create test data:
   - Students with predictions
   - Behavior records
   - Improvement records

### Test Scenarios

#### UC22 Tests

1. **Get all at-risk students**
```bash
GET /api/v1/lecturer/at-risk-students
```

2. **Filter by semester**
```bash
GET /api/v1/lecturer/at-risk-students?semester_id=1
```

3. **Filter by GPA threshold**
```bash
GET /api/v1/lecturer/at-risk-students?predicted_gpa_threshold=6.0
```

4. **Filter by stress level**
```bash
GET /api/v1/lecturer/at-risk-students?stress_level=7
```

5. **Combined filters**
```bash
GET /api/v1/lecturer/at-risk-students?semester_id=1&predicted_gpa_threshold=6.0&stress_level=7
```

#### UC23 Tests

1. **Get all improvements**
```bash
GET /api/v1/lecturer/improvement-report
```

2. **Filter by semester**
```bash
GET /api/v1/lecturer/improvement-report?semester_id=1
```

3. **Filter by student**
```bash
GET /api/v1/lecturer/improvement-report?student_id=1
```

### Expected Results

- ✅ 200 OK with data when records exist
- ✅ 200 OK with empty array when no records match
- ✅ 400 Bad Request for invalid parameters
- ✅ 401 Unauthorized without token
- ✅ 403 Forbidden for non-lecturer roles
- ✅ 404 Not Found for invalid student ID

---

## Security Considerations

### Authorization

- All endpoints require `lecturer` role
- JWT token validation on every request
- No cross-role data access

### Data Privacy

- Lecturers can view all students (no department restriction in current implementation)
- Consider adding department-based filtering if needed

### Input Validation

- All query parameters validated with express-validator
- SQL injection prevented by Sequelize ORM
- XSS prevention through JSON responses

---

## Performance Optimization

### Database

- Use indexes on foreign keys (`student_id`, `semester_id`)
- Eager loading to avoid N+1 queries
- Limit prediction history to last 5 records

### Caching (Future Enhancement)

Consider caching:
- Dashboard statistics (5-minute TTL)
- At-risk student lists (1-hour TTL)
- Improvement reports (daily refresh)

---

## Future Enhancements

### Phase 1 (High Priority)

1. Implement Excel export with `xlsx` library
2. Implement PDF export with `pdfkit` library
3. Add department-based filtering for lecturers

### Phase 2 (Medium Priority)

1. Add pagination for large result sets
2. Implement caching layer
3. Add email notifications for at-risk students
4. Create scheduled reports

### Phase 3 (Low Priority)

1. Add data visualization endpoints
2. Implement trend analysis
3. Add comparative statistics across semesters
4. Create lecturer dashboard widgets

---

## Troubleshooting

### Common Issues

1. **Empty results despite having data**
   - Check if predictions exist in `prediction_history` table
   - Verify `semester_id` matches current semester
   - Ensure `is_improvement` flag is set correctly

2. **Authorization errors**
   - Verify JWT token is valid and not expired
   - Check user role is 'lecturer'
   - Ensure middleware order is correct

3. **Performance issues**
   - Add indexes on frequently queried columns
   - Implement pagination for large datasets
   - Consider caching frequently accessed data

---

## API Documentation Update

Add these endpoints to `docs/API_ENDPOINTS.md`:

```markdown
## 👨‍🏫 Lecturer Features

### UC22: At-Risk Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/lecturer/at-risk-students` | Get at-risk students with filters |
| GET | `/lecturer/students/:id/report` | Get detailed student report |

### UC23: Improvement Report

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/lecturer/improvement-report` | Get improvement effectiveness report |

### Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/lecturer/reports/export` | Export reports to Excel/PDF |
```

---

## Conclusion

UC22 and UC23 have been successfully implemented with:

✅ Complete service layer logic
✅ Controller endpoints with error handling
✅ Route validation and authorization
✅ Comprehensive filtering capabilities
✅ Proper sorting and data formatting
✅ Edge case handling
✅ Documentation

**Status**: Ready for testing and integration with frontend.
