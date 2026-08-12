from typing import List, Dict, Any
from app.services.normalizer import normalize_skill_list

def analyze_skill_gap(user_skills: List[str], required_skills: List[str], preferred_skills: List[str] = None) -> Dict[str, Any]:
    norm_user = set(normalize_skill_list(user_skills))
    norm_req = set(normalize_skill_list(required_skills))
    norm_pref = set(normalize_skill_list(preferred_skills or []))

    matching = sorted(list(norm_user.intersection(norm_req)))
    partially_matching = sorted(list(norm_user.intersection(norm_pref)))
    missing = sorted(list(norm_req.difference(norm_user)))

    total_required = len(norm_req)
    total_matched = len(matching)

    coverage_pct = round((total_matched / total_required * 100), 1) if total_required > 0 else 100.0

    return {
        "matchingSkills": matching,
        "partiallyMatchingSkills": partially_matching,
        "missingSkills": missing,
        "totalRequired": total_required,
        "totalMatched": total_matched,
        "skillCoveragePercentage": coverage_pct
    }
