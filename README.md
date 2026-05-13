# Student Academic Prediction System

Hệ thống dự đoán và hỗ trợ cải thiện kết quả học tập cho sinh viên Khoa CNTT - ĐH Thăng Long.

## Cấu trúc dự án

```
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite + Tailwind
├── database/         # MySQL schema
└── docs/            # Documentation
```

## Yêu cầu hệ thống

- Node.js >= 18.x
- MySQL 8.x
- Python 3.8+ (cho ML model)

## Cài đặt

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Chỉnh sửa .env với thông tin database của bạn
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 3. Database

```bash
mysql -u root -p < database/schema.sql
```

## Tài liệu

- [CLAUDE.md](./CLAUDE.md) - Tổng quan dự án và quy tắc code
- [docs/PROJECT_SETUP.md](./docs/PROJECT_SETUP.md) - Hướng dẫn setup chi tiết
- [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) - Thiết kế database
- [docs/API_ENDPOINTS.md](./docs/API_ENDPOINTS.md) - API documentation

## Tech Stack

**Backend:**
- Node.js + Express.js
- Sequelize ORM (MySQL)
- JWT Authentication
- Python ML models

**Frontend:**
- React.js + Vite
- Tailwind CSS
- Recharts
- React Router DOM

## Vai trò người dùng

- **Admin**: Quản trị hệ thống, quản lý danh mục, nhập điểm
- **Student**: Nhập hành vi, xem dự báo, nhận gợi ý cải thiện
- **Lecturer**: Xem báo cáo, theo dõi sinh viên nguy cơ

## License

Private - Khóa luận tốt nghiệp 2025-2026
