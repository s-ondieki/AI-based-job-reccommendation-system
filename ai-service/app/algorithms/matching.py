import math
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.services.normalizer import normalize_skill_list, clean_text

def compute_skill_match(user_skills: List[str], required_skills: List[str], preferred_skills: List[str]) -> Tuple[float, List[str], List[str]]:
    norm_user = set(normalize_skill_list(user_skills))
    norm_req = set(normalize_skill_list(required_skills))
    norm_pref = set(normalize_skill_list(preferred_skills or []))

    if not norm_req:
        return 1.0, list(norm_user), []

    matching = list(norm_user.intersection(norm_req))
    missing = list(norm_req.difference(norm_user))

    req_score = len(matching) / len(norm_req) if len(norm_req) > 0 else 1.0
    
    pref_matching = norm_user.intersection(norm_pref)
    pref_score = len(pref_matching) / (len(norm_pref) + 1e-5) if norm_pref else 0.0

    overall_skill_score = (0.75 * req_score) + (0.25 * pref_score)
    return min(1.0, overall_skill_score), matching, missing

def compute_experience_match(user_exp_years: float, required_exp_years: float) -> float:
    if required_exp_years is None or required_exp_years <= 0:
        return 1.0
    if user_exp_years >= required_exp_years:
        return 1.0
    diff = required_exp_years - user_exp_years
    return math.exp(-0.5 * diff)

def compute_education_match(user_degrees: List[str], job_edu_req: str) -> float:
    if not job_edu_req:
        return 1.0
    
    clean_job_req = job_edu_req.lower()
    user_text = ' '.join(user_degrees).lower()

    if any(deg in clean_job_req for deg in ["bsc", "bachelor", "degree"]):
        if any(deg in user_text for deg in ["bsc", "bachelor", "degree", "msc", "phd"]):
            return 1.0
        elif "diploma" in user_text:
            return 0.7
        return 0.4
    elif "diploma" in clean_job_req:
        if any(deg in user_text for deg in ["diploma", "bsc", "bachelor"]):
            return 1.0
        return 0.5

    return 0.8

def compute_text_similarity(text1: str, text2: str) -> float:
    c1 = clean_text(text1)
    c2 = clean_text(text2)
    if not c1 or not c2:
        return 0.5
    try:
        vectorizer = TfidfVectorizer().fit([c1, c2])
        vectors = vectorizer.transform([c1, c2])
        sim = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
        return float(sim)
    except Exception:
        return 0.5

def calculate_recommendation_score(user_data: Dict[str, Any], job_data: Dict[str, Any], weights: Dict[str, float]) -> Dict[str, Any]:
    user_skills = [s.get("name", "") if isinstance(s, dict) else str(s) for s in user_data.get("skills", [])]
    required_skills = job_data.get("requiredSkills", [])
    preferred_skills = job_data.get("preferredSkills", [])

    skill_score, matching_skills, missing_skills = compute_skill_match(user_skills, required_skills, preferred_skills)

    user_total_exp = user_data.get("totalExperienceYears", 0.0)
    if not user_total_exp and user_data.get("experience"):
        user_total_exp = sum([e.get("years", 0.0) for e in user_data.get("experience", [])])
    
    exp_score = compute_experience_match(user_total_exp, job_data.get("experienceRequired", 0.0))

    user_edu_list = [f"{e.get('degree', '')} {e.get('fieldOfStudy', '')}" for e in user_data.get("education", [])]
    edu_score = compute_education_match(user_edu_list, job_data.get("educationRequirements", ""))

    desired_title = user_data.get("desiredJobTitle", "")
    interests = ' '.join(user_data.get("careerInterests", []))
    user_profile_text = f"{desired_title} {interests} {user_data.get('preferredIndustry', '')}"
    job_profile_text = f"{job_data.get('title', '')} {job_data.get('industry', '')} {job_data.get('description', '')[:200]}"
    
    interest_score = compute_text_similarity(user_profile_text, job_profile_text)

    user_loc = (user_data.get("preferredLocation") or "").lower()
    job_loc = (job_data.get("location") or "").lower()
    if not user_loc or "remote" in user_loc or "remote" in job_loc or user_loc in job_loc or job_loc in user_loc:
        loc_score = 1.0
    else:
        loc_score = 0.5

    user_certs = [c.lower() for c in user_data.get("certifications", [])]
    cert_score = 0.5
    if user_certs:
        for req in required_skills:
            if req.lower() in ' '.join(user_certs):
                cert_score = 1.0
                break

    w_skill = weights.get("skillWeight", 0.40)
    w_exp = weights.get("experienceWeight", 0.20)
    w_edu = weights.get("educationWeight", 0.15)
    w_interest = weights.get("interestWeight", 0.10)
    w_loc = weights.get("locationWeight", 0.10)
    w_cert = weights.get("certWeight", 0.05)

    overall_score = (
        (w_skill * skill_score) +
        (w_exp * exp_score) +
        (w_edu * edu_score) +
        (w_interest * interest_score) +
        (w_loc * loc_score) +
        (w_cert * cert_score)
    )

    match_percentage = round(overall_score * 100, 1)

    return {
        "jobId": job_data.get("id"),
        "matchPercentage": match_percentage,
        "overallScore": round(overall_score, 4),
        "scores": {
            "skillScore": round(skill_score * 100, 1),
            "experienceScore": round(exp_score * 100, 1),
            "educationScore": round(edu_score * 100, 1),
            "interestScore": round(interest_score * 100, 1),
            "locationScore": round(loc_score * 100, 1),
            "certScore": round(cert_score * 100, 1)
        },
        "matchingSkills": matching_skills,
        "missingSkills": missing_skills
    }
