import re
from typing import List, Dict

SKILL_ALIASES: Dict[str, str] = {
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ecmascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "python": "Python",
    "python3": "Python",
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "express": "Node.js",
    "expressjs": "Node.js",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "pgsql": "PostgreSQL",
    "aws": "Amazon Web Services",
    "amazon cloud": "Amazon Web Services",
    "azure": "Microsoft Azure",
    "gcp": "Google Cloud Platform",
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "dl": "Deep Learning",
    "nlp": "Natural Language Processing",
    "sklearn": "Scikit-Learn",
    "scikit-learn": "Scikit-Learn",
    "tf": "TensorFlow",
    "k8s": "Kubernetes",
    "kube": "Kubernetes",
    "sec+": "CompTIA Security+",
    "security+": "CompTIA Security+",
    "ccna": "CCNA",
    "sysadmin": "System Administration",
    "html5": "HTML",
    "css3": "CSS",
    "vue": "Vue.js",
    "vuejs": "Vue.js"
}

def normalize_skill(skill_name: str) -> str:
    if not skill_name:
        return ""
    cleaned = skill_name.strip().lower()
    return SKILL_ALIASES.get(cleaned, skill_name.strip().title())

def normalize_skill_list(skills: List[str]) -> List[str]:
    normalized = set()
    for s in skills:
        norm = normalize_skill(s)
        if norm:
            normalized.add(norm)
    return list(normalized)

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    return ' '.join(text.lower().split())
