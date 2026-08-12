from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from app.models.schemas import (
    RecommendationRequest,
    SkillGapRequest,
    CareerReadinessRequest
)
from app.algorithms.matching import calculate_recommendation_score
from app.algorithms.skill_gap import analyze_skill_gap
from app.algorithms.readiness import calculate_career_readiness_score
from app.algorithms.explainer import generate_recommendation_explanation
from app.algorithms.evaluator import evaluate_model_performance

app = FastAPI(
    title="AI Job Recommendation System Service",
    description="Python FastAPI engine for job matching, skill gap analysis, explainability, and career readiness scoring.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AI Job Recommendation Engine",
        "version": "1.0.0"
    }

@app.post("/recommend")
def recommend_jobs(payload: RecommendationRequest):
    try:
        user_dict = payload.user.model_dump()
        jobs_list = [j.model_dump() for j in payload.jobs]
        weights_dict = payload.weights.model_dump() if payload.weights else {}

        results = []
        for job in jobs_list:
            res = calculate_recommendation_score(user_dict, job, weights_dict)
            
            exp_explanation = generate_recommendation_explanation(
                job_title=job.get("title", ""),
                company=job.get("company", ""),
                match_percentage=res["matchPercentage"],
                scores=res["scores"],
                matching_skills=res["matchingSkills"],
                missing_skills=res["missingSkills"],
                experience_req=job.get("experienceRequired", 0.0),
                user_exp=user_dict.get("totalExperienceYears", 0.0)
            )

            res["explanation"] = exp_explanation
            results.append(res)

        results.sort(key=lambda x: x["matchPercentage"], reverse=True)
        return {
            "success": True,
            "count": len(results),
            "recommendations": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@app.post("/skill-gap")
def skill_gap_endpoint(payload: SkillGapRequest):
    try:
        res = analyze_skill_gap(payload.userSkills, payload.jobRequiredSkills, payload.jobPreferredSkills)
        return {"success": True, "data": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing skill gap: {str(e)}")

@app.post("/career-readiness")
def career_readiness_endpoint(payload: CareerReadinessRequest):
    try:
        res = calculate_career_readiness_score(
            skill_coverage=payload.skillCoverage,
            experience_match=payload.experienceMatch,
            education_match=payload.educationMatch,
            cert_match=payload.certMatch,
            interest_match=payload.interestMatch
        )
        return {"success": True, "data": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating career readiness: {str(e)}")

@app.post("/evaluate")
def evaluate_endpoint(payload: Dict[str, Any]):
    try:
        test_profiles = payload.get("testProfiles", [])
        test_jobs = payload.get("testJobs", [])
        res = evaluate_model_performance(test_profiles, test_jobs)
        return {"success": True, "evaluation": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing evaluation: {str(e)}")
