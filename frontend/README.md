# Frontend - Student Academic Prediction System

React + Vite + Tailwind CSS application.

## Structure

```
src/
├── components/      # Reusable UI components
│   ├── common/      # Button, Input, Modal, etc.
│   ├── charts/      # Chart components
│   └── layout/      # Navbar, Sidebar, Layout
├── pages/           # Page components by role
│   ├── auth/        # Login page
│   ├── admin/       # Admin pages
│   ├── student/     # Student pages
│   └── lecturer/    # Lecturer pages
├── context/         # React Context (Auth)
├── hooks/           # Custom hooks
├── services/        # API service layer
└── utils/           # Helper functions
```

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Development

```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Features

- JWT Authentication
- Role-based routing (Admin, Student, Lecturer)
- Responsive design with Tailwind CSS
- Charts with Recharts
- Form handling with React Hook Form
- Toast notifications
