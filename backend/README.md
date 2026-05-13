# Backend - Student Academic Prediction System

Node.js + Express.js REST API server.

## Structure

```
src/
├── config/          # Database and environment configuration
├── controllers/     # Route handlers
├── middleware/      # Authentication, authorization, validation
├── models/          # Sequelize models
├── routes/          # Express routers
├── services/        # Business logic
└── utils/           # Helper functions

ml/
├── model_gpa.pkl    # GPA prediction model
├── model_risk.pkl   # Risk classification model
└── predict.py       # Python prediction script
```

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

## Environment Variables

See `.env.example` for required variables.

## API Endpoints

See `docs/API_ENDPOINTS.md` for full API documentation.

## Development

```bash
npm run dev      # Start with nodemon
npm start        # Production mode
```

## Database

Run migrations:
```bash
mysql -u root -p < ../database/schema.sql
```
