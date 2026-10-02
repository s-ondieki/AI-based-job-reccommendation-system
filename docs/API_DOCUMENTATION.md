# API Documentation - AI-Based Job Recommendation System

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Register a new user account.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "role": "seeker" // "seeker" or "admin"
  }
  ```
- **Response** `(201 Created)`:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "seeker" }
  }
  ```

### `POST /api/auth/login`
Authenticate existing user.
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "password123"
  }
  ```
- **Response** `(200 OK)`:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "seeker" }
  }
  ```

### `GET /api/auth/me`
Get current logged in user details (Requires Bearer token).

---

## 2. User Profile Endpoints (`/api/users`)

### `GET /api/users/profile`
Get logged-in user profile details (education, skills, experience, certifications, preferences).

### `PUT /api/users/profile`
Update user profile.

### `POST /api/users/resume`
Upload resume PDF/DOCX (`multipart/form-data` with `resume` field).
Extracts text and returns a structured profile for review. The response includes `stage: "extraction_complete"`; it does not claim that comprehensive analysis has run. Empty or unreadable documents return `422`.

### `POST /api/users/cv-analysis`
Analyze the confirmed profile after the user reviews and saves extracted fields. Returns structured CV quality findings, career role suggestions, deterministic skill gaps with LLM context, and learning recommendations. This endpoint requires the configured server-side AI provider.

---

## 3. Job Endpoints (`/api/jobs`)

### `GET /api/jobs`
Retrieve all jobs with optional filters (`search`, `category`, `industry`, `location`, `employmentType`).

### `GET /api/jobs/:id`
Get single job listing details.

### `POST /api/jobs` *(Admin Only)*
Create a new job listing.

### `PUT /api/jobs/:id` *(Admin Only)*
Update job listing.

### `DELETE /api/jobs/:id` *(Admin Only)*
Delete job listing.

---

## 4. Recommendation & AI Endpoints (`/api/recommendations`)

### `GET /api/recommendations`
Get AI-generated top job recommendations for logged-in user with weights:
- `skillWeight`: Default 0.40
- `experienceWeight`: Default 0.20
- `educationWeight`: Default 0.15
- `interestWeight`: Default 0.10
- `locationWeight`: Default 0.10
- `certWeight`: Default 0.05

### `GET /api/recommendations/skill-gap/:jobId`
Get skill gap analysis for a specific job against user profile.

---

## 5. Application Tracking Endpoints (`/api/applications`)

### `GET /api/applications`
Get user's tracked job applications.

### `POST /api/applications`
Track application or save job. Statuses: `Saved`, `Applied`, `Interview`, `Rejected`, `Offered`, `Accepted`.

### `PUT /api/applications/:id`
Update application status or notes.

---

## 6. Admin & System Analytics (`/api/admin`)

### `GET /api/admin/statistics`
Platform statistics (Total Users, Total Jobs, Top Requested Skills, Total Applications).

### `GET /api/admin/analytics`
AI Engine evaluation and benchmark accuracy metrics.
