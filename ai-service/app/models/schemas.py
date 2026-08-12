from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class EducationItem(BaseModel):
    institution: Optional[str] = ""
    degree: Optional[str] = ""
    fieldOfStudy: Optional[str] = ""
    graduationYear: Optional[int] = None

class SkillItem(BaseModel):
    name: str
    category: Optional[str] = "General"
    proficiency: Optional[str] = "Intermediate"
    yearsOfExperience: Optional[float] = 1.0

class ExperienceItem(BaseModel):
    jobTitle: Optional[str] = ""
    company: Optional[str] = ""
    description: Optional[str] = ""
    skillsUsed: Optional[List[str]] = []
    years: Optional[float] = 1.0

class UserProfileRequest(BaseModel):
    education: Optional[List[EducationItem]] = []
    skills: Optional[List[SkillItem]] = []
    experience: Optional[List[ExperienceItem]] = []
    certifications: Optional[List[str]] = []
    desiredJobTitle: Optional[str] = ""
    preferredIndustry: Optional[str] = ""
    preferredLocation: Optional[str] = ""
    careerInterests: Optional[List[str]] = []
    totalExperienceYears: Optional[float] = 0.0

class JobItemRequest(BaseModel):
    id: str
    title: str
    company: str
    location: Optional[str] = ""
    employmentType: Optional[str] = "Full-time"
    industry: Optional[str] = ""
    description: Optional[str] = ""
    requiredSkills: List[str] = []
    preferredSkills: Optional[List[str]] = []
    educationRequirements: Optional[str] = ""
    experienceRequired: Optional[float] = 0.0

class WeightsConfig(BaseModel):
    skillWeight: float = 0.40
    experienceWeight: float = 0.20
    educationWeight: float = 0.15
    interestWeight: float = 0.10
    locationWeight: float = 0.10
    certWeight: float = 0.05

class RecommendationRequest(BaseModel):
    user: UserProfileRequest
    jobs: List[JobItemRequest]
    weights: Optional[WeightsConfig] = WeightsConfig()

class SkillGapRequest(BaseModel):
    userSkills: List[str]
    jobRequiredSkills: List[str]
    jobPreferredSkills: Optional[List[str]] = []

class CareerReadinessRequest(BaseModel):
    skillCoverage: float
    experienceMatch: float
    educationMatch: float
    certMatch: float
    interestMatch: float
