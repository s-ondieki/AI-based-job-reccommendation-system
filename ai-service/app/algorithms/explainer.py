from typing import List, Dict, Any

def generate_recommendation_explanation(
    job_title: str,
    company: str,
    match_percentage: float,
    scores: Dict[str, float],
    matching_skills: List[str],
    missing_skills: List[str],
    experience_req: float,
    user_exp: float
) -> Dict[str, Any]:
    reasons = []

    skill_score = scores.get("skillScore", 0)
    exp_score = scores.get("experienceScore", 0)
    edu_score = scores.get("educationScore", 0)

    if matching_skills:
        reasons.append(f"You possess {len(matching_skills)} matching key skills required for this role ({', '.join(matching_skills[:4])}).")

    if skill_score >= 70:
        reasons.append("Your technical skill profile strongly aligns with the core requirements.")
    elif skill_score >= 50:
        reasons.append("You have a foundational skill match for this position.")

    if exp_score >= 80:
        reasons.append(f"Your work experience meets the required threshold ({user_exp} years vs {experience_req} years required).")

    if edu_score >= 80:
        reasons.append("Your educational background directly aligns with the academic qualifications listed.")

    summary = f"Recommended for {job_title} at {company} with an overall match score of {match_percentage}%. " + " ".join(reasons)

    return {
        "summary": summary,
        "keyReasons": reasons,
        "matchingSkills": matching_skills,
        "missingSkills": missing_skills,
        "skillCoveragePct": round((len(matching_skills) / (len(matching_skills) + len(missing_skills)) * 100), 1) if (matching_skills or missing_skills) else 100.0,
        "experienceComparison": {
            "candidateYears": user_exp,
            "requiredYears": experience_req,
            "status": "Meets Expectation" if user_exp >= experience_req else "Below Requirement"
        }
    }
