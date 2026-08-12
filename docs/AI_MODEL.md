# AI Model Specification & Mathematical Formulation

## 1. Overview
The recommendation system implements a **Weighted Hybrid Matching Model** combining:
- Normalized Jaccard & TF-IDF Cosine Similarity for technical & soft skills
- Experience Years Logarithmic Scaling
- Hierarchical Educational Degree Matching
- Semantic Vector Cosine Similarity for career preferences & job descriptions

---

## 2. Weighted Scoring Formula

Given a User Profile \(U\) and Job Requirement \(J\), the overall match score \(S(U, J)\) is calculated as:

\[
S(U, J) = w_{skill} \cdot S_{skill} + w_{exp} \cdot S_{exp} + w_{edu} \cdot S_{edu} + w_{interest} \cdot S_{interest} + w_{loc} \cdot S_{loc} + w_{cert} \cdot S_{cert}
\]

Where default weights are configurable:
- \(w_{skill} = 0.40\) (Skill Alignment)
- \(w_{exp} = 0.20\) (Work Experience)
- \(w_{edu} = 0.15\) (Educational Qualification)
- \(w_{interest} = 0.10\) (Career Interest / Title Match)
- \(w_{loc} = 0.10\) (Location Match)
- \(w_{cert} = 0.05\) (Certifications)

---

## 3. Sub-Score Calculations

### A. Skill Match Score (\(S_{skill}\))
1. **Skill Normalization**: Aliases mapped (e.g. `JS` \(\rightarrow\) `JavaScript`, `ML` \(\rightarrow\) `Machine Learning`).
2. **Weighted Skill Match**:
   \[
   S_{skill} = 0.7 \times \frac{|Skills_U \cap Required_J|}{|Required_J|} + 0.3 \times \frac{|Skills_U \cap Preferred_J|}{|Preferred_J| + 1}
   \]

### B. Skill Gap Analysis & Coverage
- **Matching Skills**: \(Skills_U \cap Required_J\)
- **Missing Skills**: \(Required_J \setminus Skills_U\)
- **Skill Coverage (%)**:
  \[
  \text{Skill Coverage} = \frac{|Matching Skills|}{|RequiredSkills_J|} \times 100\%
  \]

### C. Experience Match Score (\(S_{exp}\))
For candidate experience \(E_U\) and required job experience \(E_J\):
\[
S_{exp} = \begin{cases} 
1.0 & \text{if } E_U \ge E_J \\
\exp\left(-\frac{E_J - E_U}{2}\right) & \text{if } E_U < E_J 
\end{cases}
\]

### D. Career Readiness Score (0 - 100)
A holistic score for job seeker preparedness:
\[
\text{Readiness Score} = 0.45 \times \text{Skill Coverage} + 0.20 \times (S_{exp} \times 100) + 0.15 \times (S_{edu} \times 100) + 0.10 \times (S_{cert} \times 100) + 0.10 \times (S_{interest} \times 100)
\]
Categorization:
- **85 - 100**: Highly Ready
- **70 - 84**: Ready
- **50 - 69**: Developing
- **0 - 49**: Needs Improvement

---

## 4. Explainable AI Rationale Generation
The system constructs a natural language explanation string dynamically based on sub-score evaluations:
- High skill match (\(\ge 70\%\)): "You match X out of Y required skills for this position."
- Missing critical skills: "Key skills to acquire include: [Missing Skills]."
- Experience fit: "Your experience of X years satisfies the job requirement of Y years."
- Degree alignment: "Your educational qualification in [Field] directly aligns with the job requirements."
