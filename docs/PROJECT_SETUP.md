# PROJECT_SETUP.md — Hướng dẫn khởi tạo dự án

## Yêu cầu môi trường

- Node.js >= 18.x
- MySQL 8.x
- Python 3.8+ (cho ML model)
- npm hoặc yarn

---

## Khởi tạo Backend (Node.js + Express)

```bash
mkdir backend && cd backend
npm init -y

# Core dependencies
npm install express sequelize mysql2 bcryptjs jsonwebtoken
npm install express-validator cors helmet morgan dotenv
npm install xlsx pdfkit  # xuất báo cáo

# Dev dependencies
npm install -D nodemon
```

### Cấu trúc backend/src/
```
src/
├── config/
│   ├── database.js        # Sequelize connection
│   └── env.js             # Load biến môi trường
├── controllers/
│   ├── authController.js
│   ├── adminController.js
│   ├── studentController.js
│   └── lecturerController.js
├── middleware/
│   ├── authenticate.js    # Verify JWT
│   ├── authorize.js       # Check role
│   └── validate.js        # express-validator errors
├── models/
│   ├── index.js           # Sequelize init + associations
│   ├── User.js
│   ├── Student.js
│   ├── Lecturer.js
│   ├── Department.js
│   ├── Course.js
│   ├── Semester.js
│   ├── Grade.js
│   ├── BehaviorRecord.js
│   ├── GpaTarget.js
│   ├── PredictionHistory.js
│   └── ImprovementSuggestion.js
├── routes/
│   ├── index.js           # Gộp tất cả routes
│   ├── auth.routes.js
│   ├── admin.routes.js
│   ├── student.routes.js
│   └── lecturer.routes.js
├── services/
│   ├── gpaService.js      # Tính toán GPA
│   ├── mlService.js       # Gọi Python model
│   ├── reportService.js   # Xuất báo cáo
│   └── backupService.js   # Sao lưu CSDL
└── app.js                 # Express app setup
```

### backend/.env
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=student_prediction_db
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

PYTHON_PATH=python3
ML_SCRIPT_PATH=./ml/predict.py
```

---

## Khởi tạo Frontend (React.js + Vite)

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install

# Dependencies
npm install axios react-router-dom
npm install recharts          # Biểu đồ
npm install react-hook-form   # Form handling
npm install react-hot-toast   # Notifications

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Cấu trúc frontend/src/
```
src/
├── components/
│   ├── common/              # Button, Input, Modal, Table, Badge
│   ├── charts/              # GPAChart, RadarChart, RiskBadge
│   └── layout/              # Navbar, Sidebar, Layout
├── context/
│   └── AuthContext.jsx      # User, token, login/logout
├── hooks/
│   ├── useAuth.js
│   └── useApi.js
├── pages/
│   ├── auth/
│   │   └── LoginPage.jsx
│   ├── admin/
│   │   ├── DashboardPage.jsx
│   │   ├── UsersPage.jsx
│   │   ├── StudentsPage.jsx
│   │   ├── CoursesPage.jsx
│   │   ├── SemestersPage.jsx
│   │   └── GradesPage.jsx
│   ├── student/
│   │   ├── DashboardPage.jsx
│   │   ├── GradesPage.jsx
│   │   ├── BehaviorPage.jsx
│   │   ├── PredictionPage.jsx
│   │   └── ImprovementPage.jsx
│   └── lecturer/
│       ├── DashboardPage.jsx
│       ├── AtRiskPage.jsx
│       └── ReportPage.jsx
├── services/
│   ├── api.js               # Axios instance với interceptor
│   ├── authService.js
│   ├── studentService.js
│   ├── adminService.js
│   └── lecturerService.js
└── utils/
    ├── gpaCalculator.js     # Công thức tính GPA
    └── formatters.js        # Format số, ngày tháng
```

### frontend/.env
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## Database Setup

```bash
# Tạo database
mysql -u root -p -e "CREATE DATABASE student_prediction_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Chạy schema
mysql -u root -p student_prediction_db < database/schema.sql
```

---

## Chạy dự án

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Backend: http://localhost:5000
# Frontend: http://localhost:5173
```

---

## Thứ tự implement nên theo

1. **Backend foundation**: models, DB connection, auth (login/JWT)
2. **Admin features**: quản lý user, danh mục, nhập điểm
3. **Student features**: xem điểm, nhập hành vi, đặt mục tiêu
4. **ML integration**: kết nối predict.py, API dự báo
5. **Improvement features**: gợi ý cải thiện, goal seek
6. **Lecturer features**: báo cáo, danh sách nguy cơ
7. **Frontend**: xây dựng UI theo từng chức năng song song
8. **Export/Backup**: tính năng xuất file, sao lưu

---

## Seed data mẫu

Tạo file `database/seed.sql` với:
- 1 tài khoản admin: `admin@tlu.edu.vn` / `Admin@123`
- 1 khoa CNTT
- 5-10 sinh viên mẫu
- 5-10 môn học mẫu
- 2 học kỳ (1 học kỳ hiện hành)
- Điểm mẫu cho một số sinh viên
