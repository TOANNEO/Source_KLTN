# CLAUDE.md — Hệ Thống Dự Đoán & Hỗ Trợ Cải Thiện Kết Quả Học Tập

## 1. Tổng quan dự án

Đây là hệ thống web hỗ trợ sinh viên Khoa CNTT - ĐH Thăng Long theo dõi, dự báo kết quả học tập và đưa ra gợi ý cải thiện GPA bằng Machine Learning.

**Ba vai trò người dùng:**
- `Admin`: Quản trị hệ thống, quản lý danh mục,  nhập điểm
- `Sinh viên (Student)`: Nhập hành vi,nhận gợi ý cải thiện, xem dự báo, nhận gợi ý học cải thiện các môn để đạt được GPA mong muốn
- `Giảng viên (Lecturer)`: Xem báo cáo, theo dõi sinh viên nguy cơ

---

## 2. Kiến trúc & Tech Stack

### Kiến trúc: 4-Tier Architecture
```
[Presentation Layer]  →  React.js + Tailwind CSS
[Application Layer]   →  Node.js (Express.js) + REST API
[ML Layer]            →  Python model đã huấn luyện sẵn (.pkl) — gọi qua child_process hoặc microservice nhẹ
[Data Layer]          →  MySQL
```

### Tech Stack chi tiết

**Frontend:**
- React.js (Vite hoặc CRA)
- Tailwind CSS + custom CSS
- Recharts hoặc Chart.js (biểu đồ)
- React Router DOM (routing)
- Axios (HTTP client)
- React Hook Form (form handling)

**Backend:**
- Node.js + Express.js
- Sequelize ORM (MySQL)
- JWT (xác thực)
- bcrypt (mã hóa mật khẩu)
- express-validator (validate dữ liệu)
- multer (upload file nếu cần)
- xlsx / pdfkit (xuất báo cáo)

**Machine Learning:**
- Model đã được huấn luyện trên Google Colab, lưu file `.pkl`
- Gọi model qua Python script từ Node.js (`child_process.spawn`)
- Hoặc expose qua Flask/FastAPI microservice nhẹ trên cùng server

**Database:** MySQL 8.x

---

## 3. Cấu trúc thư mục dự án

```
project-root/
├── frontend/                  # React.js app
│   ├── src/
│   │   ├── components/        # Shared UI components
│   │   ├── pages/             # Trang theo vai trò
│   │   │   ├── auth/          # Login
│   │   │   ├── admin/         # Admin pages
│   │   │   ├── student/       # Student pages
│   │   │   └── lecturer/      # Lecturer pages
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API calls (axios)
│   │   ├── context/           # AuthContext
│   │   └── utils/             # Helper functions (GPA calc, etc.)
│   └── package.json
│
├── backend/                   # Node.js + Express
│   ├── src/
│   │   ├── config/            # DB config, env
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth, role guard, validator
│   │   ├── models/            # Sequelize models
│   │   ├── routes/            # Express routers
│   │   ├── services/          # Business logic
│   │   └── utils/             # GPA calculation, helpers
│   ├── ml/                    # Python scripts + model files
│   │   ├── model_gpa.pkl      # Regression model
│   │   ├── model_risk.pkl     # Classification model
│   │   └── predict.py         # Script nhận JSON input, trả JSON output
│   └── package.json
│
└── database/
    └── schema.sql             # DDL script tạo bảng
```

---

## 4. Quy tắc code

### General
- Dùng tiếng Anh cho tên biến, hàm, tên file; tiếng Việt cho comment quan trọng
- Không commit file `.env`
- Mọi API response đều có dạng: `{ success: true/false, data: ..., message: "..." }`

### Backend (Node.js)
- Express route → Controller → Service (tách bạch rõ ràng)
- Validate input bằng `express-validator` trước khi vào controller
- Xác thực JWT middleware: `authenticateToken`
- Phân quyền middleware: `requireRole('admin')`, `requireRole('student')`, `requireRole('lecturer')`
- Công thức tính GPA TLU: `total =   0.3*gk + 0.7*ck` (thang 10), GPA tích lũy = Σ(điểm_i × tinchi_i) / Σtinchi_i

### Frontend (React.js)
- Dùng functional components + hooks
- Tailwind cho layout và spacing, custom CSS cho thiết kế đặc thù
- Route guard theo role: nếu không đủ quyền, redirect về `/unauthorized`
- Lưu token trong `localStorage`, user info trong `AuthContext`

### ML Integration
- File predict.py nhận input JSON qua stdin, trả output JSON qua stdout
- Format input: xem `docs/ML_INPUT_FORMAT.md`
- Không dùng Python cho bất kỳ logic nào khác ngoài inference

---

## 5. Commands thường dùng

```bash
# Backend
cd backend && npm install
npm run dev          # nodemon
npm run start        # production

# Frontend
cd frontend && npm install
npm run dev          # Vite dev server
npm run build        # Build production

# Database
mysql -u root -p < database/schema.sql

# Test ML model thủ công
cd backend/ml
echo '{"study_hours":6,"sleep_duration":7,...}' | python predict.py
```

---

## 6. File tài liệu quan trọng (đọc khi cần)

- `docs/DATABASE_SCHEMA.md` — Chi tiết toàn bộ bảng và quan hệ
- `docs/API_ENDPOINTS.md` — Danh sách tất cả API endpoints
- `docs/ML_INPUT_FORMAT.md` — Format input/output cho model ML
- `docs/FEATURES.md` — Chi tiết các chức năng (Use Case)
- `docs/GPA_FORMULA.md` — Công thức tính GPA của TLU
