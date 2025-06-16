## Project Overview

EpiReady is a disease intelligence platform with three long-term goals:

- Outbreak Prediction – When and where diseases are likely to emerge
- Cold Chain Risk Detection – Flag risks in transporting sensitive medical
products
- Pathogen Evolution Tracking – Detect and respond to disease mutations to
support drug repurposing

We are currently focusing on cold chain logistics for MVP development. The MVP helps diagnostic labs, vaccine manufacturers, and biotech distributors prevent cold chain failures using a lightweight, rule-based risk alert system. Some of the core features include

- Location and weather map
- Rule builder for email/text alerts
- Realtime status dashboard for transports

## Installation Instructions

### Prerequisites
- Node.js
- Python 3
- npm


### Backend Setup
1. Navigate to the backend directory:
   ```
   cd epiready-backend
   ```
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Start the backend server:
   ```
   python app.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd epiready-frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Go to http://localhost:5173/

### Database Setup

1. Install PostgreSQL - Guide: https://www.prisma.io/dataguide/postgresql/setting-up-a-local-postgresql-database

2. Create .env in the folder epiready-backend and add following to it:
```
DB_USER=postgres
DB_PASSWORD="Your password here" - avoid special characters
DB_HOST=localhost
DB_PORT=5432
DB_NAME=epiready
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
FRONTEND_ORIGINS=http://localhost:5173/
SECRET_KEY=create secret key from this command in terminal/cmd prompt: python -c "import secrets, sys; sys.stdout.write(secrets.token_hex(32))"
```

## Development Workflow

### Branching Strategy
We follow the Git Flow branching strategy:
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feat/*` - New features and enhancements
- `fix/*` - Bug fixes
- `release/*` - Release preparation
- `hotfix/*` - Urgent production fixes

### Ticketing and Issue Management

Any new bugs found will be ticketed to Github Issues which will then be linked to the ticket in JIRA as well. Main and develop branches have rulesets added and any changes there must be reviewed by another member before being pushed.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request to develop
