# AI-Based Job Recommendation System

[![Project Type](https://img.shields.io/badge/Project-Academic%20Final%20Year-blue)](#)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Python%20%7C%20MongoDB-green)](#)

An intelligent, explainable web application for automated job matching, skill-gap analysis, career readiness scoring, personalized learning recommendations, and career development planning. Developed for a final-year Bachelor of Information Technology degree project.

---

## 🌟 Key Features

1. **AI Job Recommendation Engine**: Multi-factor weighted job matching using Jaccard & TF-IDF Cosine Similarity.
2. **Explainable AI (XAI)**: Generates human-understandable explanations detailing why each job was recommended.
3. **Skill-Gap Analysis**: Compares candidate profile against required job skills to highlight matched vs missing skills.
4. **Career Readiness Score (0 - 100)**: Quantitative preparedness metric categorized into *Needs Improvement*, *Developing*, *Ready*, and *Highly Ready*.
5. **Personalized Learning Recommendations**: Auto-suggests courses and tutorials mapped to candidate skill gaps.
6. **Career Roadmap Generator**: Interactive career progression plan allowing users to track milestone completion.
7. **CV / Resume Extractor**: Automated text parsing for PDF/DOCX resumes with an interactive review & correction modal.
8. **Application Tracker**: Full lifecycle application management (Saved, Applied, Interview, Offer, Rejected, Accepted).
9. **Admin Management Dashboard**: Platform analytics, user roles management, job listings CRUD, skill alias dictionary, and dataset tools.
10. **AI Model Evaluation Module**: Benchmarks recommendation precision, recall, and system latency.

---

## 🏗 System Architecture

```
Frontend (React + Vite + Tailwind CSS)
   │
   │  REST API (Axios)
   ▼
Backend (Node.js + Express + JWT)
   │
   ├─────────────► MongoDB Database (Mongoose)
   │
   └─────────────► Python FastAPI AI Service (scikit-learn, TF-IDF, Cosine Similarity)
```

---

## 📁 Repository Structure

```
ai-job-recommendation-system/
├── frontend/             # React SPA with Vite & Tailwind CSS
├── backend/              # Node.js Express REST API & Database Models
├── ai-service/           # Python FastAPI recommendation & NLP service
├── data/                 # JSON datasets (jobs, skills, learning resources)
├── docs/                 # Documentation (API, AI Model, Database Schema)
├── .env.example          # Environment variables template
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: v18+ & `npm`
- **Python**: v3.9+ & `pip`
- **MongoDB**: Local MongoDB community server running on port `27017` (or MongoDB Atlas connection string)

### 2. Configure Environment Variables
Create `backend/.env` from `backend/.env.example` and keep the real file uncommitted. Set the server-side OpenAI settings:

```env
OPENAI_API_KEY=your-openai-api-key
OPENAI_ENABLED=true
OPENAI_MODEL=gpt-4.1-mini
```

The key belongs only in the backend environment, never in React or frontend environment variables. Gemini and Grok remain available as fallback providers.

### 3. Backend Setup
```bash
cd backend
npm install
npm run seed     # Populate 30+ jobs, 50+ skills, 30+ learning resources, admin & demo users
npm run dev      # Starts backend on http://localhost:5000
```

### 4. AI Service Setup
```bash
cd ai-service
python -m venv venv
# On Windows:
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 5. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts frontend on http://localhost:5173
```

After both servers start, sign in, upload a PDF or DOCX CV, review the extracted fields, and confirm them. The backend then sends the extracted text/profile to OpenAI for structured CV analysis while the existing deterministic matching and readiness algorithms remain in use.

---

## 🔑 Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@jobai.edu` | `admin123` |
| **Job Seeker** | `student@jobai.edu` | `student123` |

---

## 📄 License & Academic Attribution
Developed as an academic final-year project for Bachelor of Information Technology.
