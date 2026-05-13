# Database Schema

MySQL database for Student Academic Prediction System.

## Setup

```bash
# Create database and tables
mysql -u root -p < schema.sql
```

## Tables

- `users` - User accounts (admin, student, lecturer)
- `departments` - Academic departments
- `students` - Student profiles
- `lecturers` - Lecturer profiles
- `semesters` - Academic semesters
- `courses` - Course catalog
- `grades` - Student grades
- `behavior_records` - Student behavior data
- `gpa_targets` - Student GPA goals
- `prediction_history` - ML prediction results
- `improvement_suggestions` - AI-generated suggestions

## Relationships
 
See `docs/DATABASE_SCHEMA.md` for detailed schema documentation.

## Seed Data

To populate with sample data:
```bash
mysql -u root -p student_prediction_db < seed.sql
```
