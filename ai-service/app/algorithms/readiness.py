from typing import Dict, Any

def calculate_career_readiness_score(
    skill_coverage: float,
    experience_match: float,
    education_match: float,
    cert_match: float = 50.0,
    interest_match: float = 70.0
) -> Dict[str, Any]:
    score = (
        (0.45 * skill_coverage) +
        (0.20 * experience_match) +
        (0.15 * education_match) +
        (0.10 * cert_match) +
        (0.10 * interest_match)
    )

    score = round(max(0.0, min(100.0, score)), 1)

    if score >= 85:
        level = "Highly Ready"
        color = "green"
    elif score >= 70:
        level = "Ready"
        color = "blue"
    elif score >= 50:
        level = "Developing"
        color = "yellow"
    else:
        level = "Needs Improvement"
        color = "red"

    return {
        "readinessScore": score,
        "readinessLevel": level,
        "color": color,
        "breakdown": {
            "skillCoverageWeighted": round(0.45 * skill_coverage, 1),
            "experienceMatchWeighted": round(0.20 * experience_match, 1),
            "educationMatchWeighted": round(0.15 * education_match, 1),
            "certMatchWeighted": round(0.10 * cert_match, 1),
            "interestMatchWeighted": round(0.10 * interest_match, 1)
        },
        "disclaimer": "This score is an AI-generated guidance metric based on profile analysis and does not guarantee employment."
    }
