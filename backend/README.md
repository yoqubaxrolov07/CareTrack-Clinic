# CareTrack Clinic - MRMS Backend

Backend for the **Medical Record Management System** built for CareTrack Clinic
(BTEC Unit 25 - Full Stack Development assignment).

Stack: **Node.js + Express + MySQL**, JWT auth, bcrypt, role-based access.

---

## 1. Setup

```bash
# 1. Install deps
cd backend
npm install

# 2. Copy env file and fill in your MySQL password / JWT secret
cp .env.example .env

# 3. Create the database + tables + seed data
npm run db:init

# 4. Start the server
npm run dev        # nodemon (auto-reload)
# or
npm start
```

The server runs on `http://localhost:5000` by default.

---

## 2. Database

- Database name: `caretrack_mrms`
- Schema:        `src/database/schema.sql`
- Seed data:     `src/database/seed.sql`
- Reference SQL queries: `src/database/example_queries.sql`

You can also run the SQL files manually from MySQL Workbench instead of using
`npm run db:init`.

### Tables

| Table       | Purpose                                       |
|-------------|-----------------------------------------------|
| users       | Staff accounts with login (admin / clinician / receptionist) |
| doctors     | Doctor profiles (specialty, department, ...)  |
| patients    | Patient records, each assigned to one doctor  |
| diagnoses   | Disease/diagnosis records linked to a patient |

### Relationships

- One **doctor** -> many **patients**
- One **patient** -> one **doctor**
- One **patient** -> many **diagnoses**
- One **diagnosis** -> one **patient**

---

## 3. Roles & Permissions (from the assignment brief)

| Role          | Doctors     | Patients         | Diagnoses        |
|---------------|-------------|------------------|------------------|
| admin         | Full CRUD   | Full CRUD        | Full CRUD        |
| clinician     | Read        | Read + Update    | Full CRUD (no delete) |
| receptionist  | Read        | Create + Read    | None             |

---

## 4. API Endpoints

Base URL: `http://localhost:5000/api`

### Auth
| Method | Path           | Access        | Description                  |
|--------|----------------|---------------|------------------------------|
| POST   | /auth/register | admin         | Create a new staff account   |
| POST   | /auth/login    | public        | Returns a JWT                |
| GET    | /auth/me       | any logged-in | Current user profile         |

### Doctors
| Method | Path             | Access            |
|--------|------------------|-------------------|
| GET    | /doctors         | any logged-in     |
| GET    | /doctors/:id     | any logged-in     |
| POST   | /doctors         | admin             |
| PUT    | /doctors/:id     | admin             |
| DELETE | /doctors/:id     | admin             |

### Patients
| Method | Path                          | Access                  |
|--------|-------------------------------|-------------------------|
| GET    | /patients                     | any logged-in           |
| GET    | /patients/:id                 | any logged-in           |
| GET    | /patients/:id/profile         | any logged-in (full profile = patient + doctor + diagnoses) |
| POST   | /patients                     | admin, receptionist     |
| PUT    | /patients/:id                 | admin, clinician        |
| PATCH  | /patients/:id/assign-doctor   | admin                   |
| DELETE | /patients/:id                 | admin                   |

### Diagnoses
| Method | Path             | Access            |
|--------|------------------|-------------------|
| GET    | /diagnoses       | admin, clinician  |
| GET    | /diagnoses/:id   | admin, clinician  |
| POST   | /diagnoses       | admin, clinician  |
| PUT    | /diagnoses/:id   | admin, clinician  |
| DELETE | /diagnoses/:id   | admin             |

All search endpoints accept a `?search=...` query string.

---

## 5. Quick test (curl)

```bash
# Login as the seeded admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@caretrack.test","password":"Admin@123"}'

# Use the returned token
curl http://localhost:5000/api/doctors \
  -H "Authorization: Bearer <PASTE_TOKEN_HERE>"
```

---

## 6. Folder structure

```
src/
  config/        env + MySQL pool
  database/      schema.sql, seed.sql, example queries, init script
  middleware/    auth, role, validation, errors
  utils/         JWT helper, asyncHandler, ApiError
  models/        SQL queries (data access layer)
  controllers/   business logic
  routes/        REST endpoints
  app.js         Express app
  server.js      entry point
```
