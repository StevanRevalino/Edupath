# 🎯 RIASEC Career Assessment System - Complete Flow Documentation

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [Assessment Flow](#assessment-flow)
4. [Scoring Algorithm](#scoring-algorithm)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Seeding Process](#seeding-process)

---

## 🌟 System Overview

**Purpose**: Tes Minat & Bakat Karier - Help students discover their personality type and get university major recommendations based on Holland's RIASEC theory.

**Theory Base**: Holland's RIASEC Hexagon Model

- **R**ealistic - hands-on, technical work
- **I**nvestigative - analytical, research-oriented
- **A**rtistic - creative, expressive
- **S**ocial - helping, teaching people
- **E**nterprising - leadership, business
- **C**onventional - organized, detail-oriented

**Algorithm Type**: Rule-based scoring with compatibility matrix

---

## 🗄️ Database Schema

### 1. `RiasecQuestion` Table

Stores 60 assessment questions (10 per RIASEC type)

```prisma
model RiasecQuestion {
  question_id   Int         @id @default(autoincrement())
  question_text String
  riasec_type   RiasecType  // REALISTIC | INVESTIGATIVE | ARTISTIC | SOCIAL | ENTERPRISING | CONVENTIONAL
  dimension     String      // activities | values | self_perception | environment
  created_at    DateTime    @default(now())
}
```

**Data Structure**:

- 6 types × 10 questions = 60 total
- Each type has 4 dimensions (activities, values, self-perception, environment)

### 2. `RiasecAssessment` Table

Stores each user's assessment session

```prisma
model RiasecAssessment {
  assessment_id Int       @id @default(autoincrement())
  user_id       Int
  holland_code  String    // 3-letter code (e.g., "RIA", "SEC")
  created_at    DateTime  @default(now())

  // Scores for each type (0-50 range)
  realistic_score      Int
  investigative_score  Int
  artistic_score       Int
  social_score         Int
  enterprising_score   Int
  conventional_score   Int

  user          User                     @relation(fields: [user_id], references: [user_id])
  responses     RiasecResponse[]
  recommendations RiasecRecommendation[]
}
```

### 3. `RiasecResponse` Table

Stores individual answer for each question

```prisma
model RiasecResponse {
  response_id   Int       @id @default(autoincrement())
  assessment_id Int
  question_id   Int
  answer_value  Int       // Likert scale: 1-5

  assessment    RiasecAssessment @relation(fields: [assessment_id], references: [assessment_id])
  question      RiasecQuestion   @relation(fields: [question_id], references: [question_id])
}
```

### 4. `RiasecProdiMapping` Table

Maps RIASEC types to university majors (prodi)

```prisma
model RiasecProdiMapping {
  mapping_id          Int         @id @default(autoincrement())
  prodi_id            String
  primary_type        RiasecType  // Main personality type
  secondary_type      RiasecType? // Optional secondary type
  compatibility_score Int         // Base score: 80-100

  prodi               Prodi       @relation(fields: [prodi_id], references: [prodi_id])
  recommendations     RiasecRecommendation[]
}
```

**Keywords-based Matching**: Each mapping has multiple keywords to handle name variations

```typescript
{
  keywords: ["Teknik Informatika", "Informatika", "Ilmu Komputer", "Computer Science"],
  primary_type: "REALISTIC",
  secondary_type: "INVESTIGATIVE",
  compatibility_score: 85
}
```

### 5. `RiasecRecommendation` Table

Stores final recommendations with calculated match percentages

```prisma
model RiasecRecommendation {
  recommendation_id Int       @id @default(autoincrement())
  assessment_id     Int
  mapping_id        Int
  match_percentage  Float     // Calculated: 0-100%
  rank              Int       // Ranking: 1-20

  assessment        RiasecAssessment    @relation(fields: [assessment_id], references: [assessment_id])
  mapping           RiasecProdiMapping  @relation(fields: [mapping_id], references: [mapping_id])
}
```

---

## 🔄 Assessment Flow

### **Step 1: Start Assessment**

```
User clicks "Mulai Tes" → Frontend navigates to /tes/pertanyaan
```

### **Step 2: Fetch Questions**

```typescript
// Frontend: client/src/pages/user/Tes-Pertanyaan/index.tsx
GET /api/riasec/questions

// Backend: server/src/controllers/riasecController.ts
→ riasecService.getQuestions()
→ Returns 60 questions from database
```

**Frontend Processing**:

```typescript
// Shuffle questions using Fisher-Yates algorithm
const shuffled = [...questions].sort(() => Math.random() - 0.5);

// Store answers in Map<question_id, answer_value>
const [answers, setAnswers] = useState<Map<number, number>>(new Map());
```

### **Step 3: User Answers Questions**

- Display 10 questions per page (6 pages total)
- Likert scale: 1 (Sangat Tidak Setuju) - 5 (Sangat Setuju)
- Progress bar shows completion percentage
- `useRef` + `scrollIntoView` for automatic scroll-to-top on page change

### **Step 4: Submit Assessment**

```typescript
// Frontend submits answers
POST /api/riasec/submit
Body: {
  user_id: number,
  responses: [
    { question_id: 1, answer_value: 4 },
    { question_id: 2, answer_value: 3 },
    // ... 60 total
  ]
}

// Backend: riasecController.submitAssessment()
→ riasecService.submitAssessment(user_id, responses)
```

### **Step 5: Backend Processing**

#### 5.1 Calculate Scores

```typescript
// server/src/services/riasecService.ts
function calculateScores(responses) {
  const scores = {
    REALISTIC: 0,
    INVESTIGATIVE: 0,
    ARTISTIC: 0,
    SOCIAL: 0,
    ENTERPRISING: 0,
    CONVENTIONAL: 0,
  };

  // Sum answer values for each type
  for (response in responses) {
    const question = await getQuestion(response.question_id);
    scores[question.riasec_type] += response.answer_value;
  }

  return scores;
}
```

**Score Range**:

- Min: 10 × 1 = 10 (all "Sangat Tidak Setuju")
- Max: 10 × 5 = 50 (all "Sangat Setuju")

#### 5.2 Generate Holland Code

```typescript
function getHollandCode(scores) {
  // Sort types by score (descending)
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3); // Take top 3

  // Return 3-letter code
  return sorted.map(([type]) => type[0]).join("");
  // Example: "RIA", "SEC", "AIS"
}
```

#### 5.3 Save Assessment

```typescript
const assessment = await prisma.riasecAssessment.create({
  data: {
    user_id,
    holland_code: "RIA",
    realistic_score: 45,
    investigative_score: 40,
    artistic_score: 35,
    social_score: 30,
    enterprising_score: 25,
    conventional_score: 20,
  },
});

// Save all 60 responses
await prisma.riasecResponse.createMany({
  data: responses.map((r) => ({
    assessment_id: assessment.assessment_id,
    question_id: r.question_id,
    answer_value: r.answer_value,
  })),
});
```

#### 5.4 Generate Recommendations

```typescript
async function getRecommendations(assessmentId, hollandCode, scores) {
  // Extract primary, secondary, tertiary types from holland code
  const [primary, secondary, tertiary] = hollandCode.split("");

  // Fetch mappings that match primary or secondary type
  const mappings = await prisma.riasecProdiMapping.findMany({
    where: {
      OR: [
        { primary_type: primaryType },
        { secondary_type: primaryType },
        { primary_type: secondaryType },
        { secondary_type: secondaryType },
      ],
    },
    include: { prodi: true },
  });

  // Calculate match percentage for each prodi
  const recommendations = mappings.map((mapping) => {
    const matchPercentage = calculateMatchPercentage(
      mapping,
      hollandCode,
      scores
    );

    return {
      mapping,
      match_percentage: matchPercentage,
    };
  });

  // Sort by match percentage and take top 20
  const top20 = recommendations
    .sort((a, b) => b.match_percentage - a.match_percentage)
    .slice(0, 20);

  // Save recommendations to database
  await prisma.riasecRecommendation.createMany({
    data: top20.map((rec, index) => ({
      assessment_id: assessmentId,
      mapping_id: rec.mapping.mapping_id,
      match_percentage: rec.match_percentage,
      rank: index + 1,
    })),
  });

  return top20;
}
```

---

## 🧮 Scoring Algorithm

### **Match Percentage Calculation**

```typescript
function calculateMatchPercentage(
  mapping: RiasecProdiMapping,
  hollandCode: string,
  scores: ScoresObject
): number {
  const [primary, secondary, tertiary] = hollandCode.split("");

  let matchScore = 0;

  // 1. Primary Type Match (60% weight)
  if (mapping.primary_type[0] === primary) {
    matchScore += 60;
  } else if (mapping.primary_type[0] === secondary) {
    matchScore += 40;
  } else if (mapping.primary_type[0] === tertiary) {
    matchScore += 20;
  }

  // 2. Secondary Type Match (30% weight)
  if (mapping.secondary_type) {
    if (mapping.secondary_type[0] === primary) {
      matchScore += 30;
    } else if (mapping.secondary_type[0] === secondary) {
      matchScore += 20;
    } else if (mapping.secondary_type[0] === tertiary) {
      matchScore += 10;
    }
  }

  // 3. Base Compatibility Score (10% weight)
  // Scale from 80-100 to 0-10
  const baseScore = ((mapping.compatibility_score - 80) / 20) * 10;
  matchScore += baseScore;

  return Math.min(matchScore, 100); // Cap at 100%
}
```

### **Example Calculation**

**Student Profile**:

- Holland Code: `"RIA"` (Realistic-Investigative-Artistic)
- Scores: R=45, I=40, A=35, S=30, E=25, C=20

**Prodi 1: Teknik Informatika**

- Primary: REALISTIC
- Secondary: INVESTIGATIVE
- Base: 85

```
Primary match:  R = R  → 60 points
Secondary match: I = I → 30 points
Base score: (85-80)/20 * 10 → 2.5 points
Total: 92.5%
```

**Prodi 2: Kedokteran**

- Primary: INVESTIGATIVE
- Secondary: SOCIAL
- Base: 100

```
Primary match:  I = I (secondary) → 40 points
Secondary match: S = S (tertiary) → 0 points
Base score: (100-80)/20 * 10 → 10 points
Total: 50%
```

**Prodi 3: Seni Musik**

- Primary: ARTISTIC
- Secondary: null
- Base: 100

```
Primary match:  A = A (tertiary) → 20 points
Secondary match: null → 0 points
Base score: (100-80)/20 * 10 → 10 points
Total: 30%
```

**Ranking**: Teknik Informatika (92.5%) > Kedokteran (50%) > Seni Musik (30%)

---

## 🔌 API Endpoints

### 1. **GET** `/api/riasec/questions`

Get all assessment questions

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "question_id": 1,
      "question_text": "Saya suka bekerja dengan peralatan dan mesin",
      "riasec_type": "REALISTIC",
      "dimension": "activities"
    }
    // ... 60 questions
  ]
}
```

### 2. **POST** `/api/riasec/submit`

Submit assessment answers

**Request**:

```json
{
  "user_id": 123,
  "responses": [
    { "question_id": 1, "answer_value": 4 },
    { "question_id": 2, "answer_value": 3 }
    // ... 60 responses
  ]
}
```

**Response**:

```json
{
  "success": true,
  "message": "Assessment submitted successfully",
  "data": {
    "assessment_id": 456,
    "holland_code": "RIA",
    "scores": {
      "realistic": 45,
      "investigative": 40,
      "artistic": 35,
      "social": 30,
      "enterprising": 25,
      "conventional": 20
    },
    "recommendations": [
      {
        "rank": 1,
        "nama_prodi": "Teknik Informatika",
        "match_percentage": 92.5,
        "primary_type": "REALISTIC",
        "secondary_type": "INVESTIGATIVE"
      }
      // ... top 20
    ]
  }
}
```

### 3. **GET** `/api/riasec/history/:userId`

Get user's assessment history

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "assessment_id": 456,
      "holland_code": "RIA",
      "created_at": "2025-01-15T10:30:00Z",
      "realistic_score": 45,
      "investigative_score": 40
      // ... other scores
    }
  ]
}
```

### 4. **GET** `/api/riasec/result/:assessmentId`

Get detailed results for specific assessment

**Response**:

```json
{
  "success": true,
  "data": {
    "assessment_id": 456,
    "holland_code": "RIA",
    "scores": {
      /* ... */
    },
    "recommendations": [
      /* top 20 prodi */
    ],
    "personality_description": "Realistic types are...",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

---

## 🎨 Frontend Components

### 1. **Tes-Pertanyaan Page**

`client/src/pages/user/Tes-Pertanyaan/index.tsx`

**Features**:

- Fisher-Yates shuffle algorithm for random question order
- Pagination (10 questions per page)
- Scroll-to-top on page change using `useRef`
- Progress bar (0-100%)
- Answer storage in `Map<question_id, answer_value>`

**Key Code**:

```typescript
// Shuffle questions
const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
useEffect(() => {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  setShuffledQuestions(shuffled);
}, [questions]);

// Scroll to top
const topRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  topRef.current?.scrollIntoView({ behavior: "smooth" });
}, [currentPage]);

// Handle submit
const handleSubmit = async () => {
  const responses = Array.from(answers.entries()).map(([qId, value]) => ({
    question_id: qId,
    answer_value: value,
  }));

  const result = await riasecService.submitAssessment(userId, responses);
  navigate(`/tes/hasil/${result.assessment_id}`, {
    state: { result },
  });
};
```

### 2. **HasilTes Page**

`client/src/pages/user/TesJurusan/HasilTes.tsx`

**Features**:

- Display Holland code with visual badge
- Show personality type description
- Radar chart for 6 RIASEC scores
- Top 20 prodi recommendations with match percentage
- Progress bars for each recommendation

**Key Code**:

```typescript
const { assessmentId } = useParams();
const location = useLocation();

// Get result from navigation state or API
const [result, setResult] = useState(location.state?.result);

useEffect(() => {
  if (!result && assessmentId) {
    riasecService
      .getAssessmentResult(assessmentId)
      .then((data) => setResult(data));
  }
}, [assessmentId]);

// Display recommendations
{
  result.recommendations.map((rec, index) => (
    <div key={index}>
      <h3>
        {rec.rank}. {rec.nama_prodi}
      </h3>
      <p>Match: {rec.match_percentage}%</p>
      <ProgressBar value={rec.match_percentage} />
    </div>
  ));
}
```

---

## 🌱 Seeding Process

### **1. Seed Questions**

`server/prisma/seed/riasecQuestions.ts`

**Structure**: 60 questions based on Holland's 4 dimensions

```typescript
export const riasecQuestions = [
  // REALISTIC (10 questions)
  { question_text: "...", riasec_type: "REALISTIC", dimension: "activities" },
  { question_text: "...", riasec_type: "REALISTIC", dimension: "values" },
  {
    question_text: "...",
    riasec_type: "REALISTIC",
    dimension: "self_perception",
  },
  { question_text: "...", riasec_type: "REALISTIC", dimension: "environment" },
  // ... repeat for all 6 types
];
```

### **2. Seed Prodi Mappings**

`server/prisma/seed/riasecMapping.ts`

**Keywords-based System**:

```typescript
export const riasecProdiMapping: ProdiMapping[] = [
  {
    keywords: [
      "Teknik Informatika",
      "Informatika",
      "Ilmu Komputer",
      "Computer Science",
    ],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 85,
  },
  // ... 85 total mappings
];
```

### **3. Seed Script**

`server/prisma/seed/seedRiasec.ts`

**Process**:

```typescript
// 1. Clear existing data
await prisma.riasecQuestion.deleteMany();
await prisma.riasecProdiMapping.deleteMany();

// 2. Seed questions
for (const question of riasecQuestions) {
  await prisma.riasecQuestion.create({ data: question });
}

// 3. Seed mappings with keyword matching
for (const mapping of riasecProdiMapping) {
  // Try each keyword until match found
  let prodi = null;
  for (const keyword of mapping.keywords) {
    prodi = await prisma.prodi.findFirst({
      where: {
        nama_prodi: { contains: keyword, mode: "insensitive" },
      },
    });
    if (prodi) break;
  }

  // Create mapping if prodi exists
  if (prodi) {
    await prisma.riasecProdiMapping.create({
      data: {
        prodi_id: prodi.prodi_id,
        primary_type: mapping.primary_type,
        secondary_type: mapping.secondary_type,
        compatibility_score: mapping.compatibility_score,
      },
    });
  }
}
```

**Run Command**:

```bash
npx ts-node prisma/seed/seedRiasec.ts
```

**Results**:

- ✅ 60 questions seeded
- ✅ 75 prodi mappings created (10 not found in database)

---

## 🎯 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

1. START
   │
   ├─> User clicks "Mulai Tes" button
   │
   ├─> Navigate to /tes/pertanyaan
   │
   └─> GET /api/riasec/questions

2. ANSWER QUESTIONS
   │
   ├─> Shuffle 60 questions (Fisher-Yates)
   │
   ├─> Display 10 per page (6 pages)
   │
   ├─> User selects Likert scale 1-5 for each
   │
   ├─> Store in Map<question_id, answer_value>
   │
   └─> Progress bar updates

3. SUBMIT
   │
   ├─> Validate all 60 answered
   │
   ├─> POST /api/riasec/submit
   │   └─> Body: { user_id, responses[] }
   │
   └─> Backend Processing:
       │
       ├─> Calculate scores (sum by type)
       │   └─> { R:45, I:40, A:35, S:30, E:25, C:20 }
       │
       ├─> Generate Holland Code (top 3)
       │   └─> "RIA"
       │
       ├─> Save Assessment + Responses
       │
       ├─> Fetch matching prodi mappings
       │
       ├─> Calculate match % for each prodi
       │   └─> Formula: 60% primary + 30% secondary + 10% base
       │
       ├─> Rank top 20 recommendations
       │
       └─> Save RiasecRecommendation records

4. RESULTS
   │
   ├─> Navigate to /tes/hasil/:assessmentId
   │
   ├─> Display Holland Code badge
   │
   ├─> Show personality description
   │
   ├─> Render score radar chart
   │
   └─> List top 20 prodi with match %

5. HISTORY
   │
   ├─> User can view past assessments
   │
   └─> GET /api/riasec/history/:userId
```

---

## 📊 Data Statistics

**Current System**:

- **Questions**: 60 (10 per type × 6 types)
- **Dimensions**: 4 per type (activities, values, self-perception, environment)
- **Prodi Mappings**: 85 defined (75 matched in database)
- **Keywords**: ~200 total variations handled
- **Recommendations**: Top 20 per assessment
- **Score Range**: 10-50 per type
- **Match Range**: 0-100%

**Example Distribution**:

```
REALISTIC:      15 prodi (Teknik, Engineering)
INVESTIGATIVE:  15 prodi (Sains, Medicine)
ARTISTIC:       14 prodi (Desain, Seni, Komunikasi)
SOCIAL:         14 prodi (Pendidikan, Keperawatan)
ENTERPRISING:   14 prodi (Bisnis, Manajemen)
CONVENTIONAL:   13 prodi (Akuntansi, Administrasi)
```

---

## 🔧 Technical Notes

### **Performance Optimizations**:

1. Question shuffle happens once on mount (not on every render)
2. Prisma includes used for reducing N+1 queries
3. Recommendations limited to top 20 (not all matches)
4. Assessment results cached in `location.state`

### **Validation Rules**:

1. All 60 questions must be answered before submit
2. Answer values must be 1-5 (Likert scale)
3. User must be authenticated (user_id required)
4. Holland code must be exactly 3 characters

### **Error Handling**:

1. Question fetch failure → Show error message
2. Incomplete answers → Highlight missing questions
3. Submit failure → Allow retry with preserved answers
4. Result not found → Fetch from API by assessmentId

---

## 📚 References

**Holland's RIASEC Theory**:

- Book: "Making Vocational Choices: A Theory of Vocational Personalities and Work Environments"
- ISBN: 978-1-7365779-7-4
- Table 4.1: Summary of Holland Types Related to Major Fields

**Implementation Reference**:

- Database: PostgreSQL (Supabase)
- ORM: Prisma
- Backend: Node.js + Express + TypeScript
- Frontend: React + TypeScript + Vite
- Routing: React Router v6

---

## 🎓 Conclusion

This RIASEC system provides:
✅ **Accurate personality assessment** using 60 validated questions  
✅ **Intelligent prodi recommendations** via rule-based algorithm  
✅ **Flexible name matching** with keywords system  
✅ **Complete user journey** from test to results  
✅ **Historical tracking** for multiple assessments

**System Status**: ✅ Fully operational and seeded with 75 prodi mappings
