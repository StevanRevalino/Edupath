# Tes Minat Bakat - Code Flow Documentation

## Overview

This document describes the code flow for the "Melakukan Tes Minat Bakat" (Career Interest Test) feature using the Holland RIASEC assessment system. The flow follows the activity diagram and includes test navigation, question answering, validation, algorithm-based analysis, and results display.

## Activity Diagram Flow

1. User accesses EDUPATH main page → System displays homepage
2. User clicks 'Tes' on navigation bar → System displays Tes page
3. User clicks '+' button (tutorial) → System displays tutorial
4. User clicks 'Mulai tes' → System fetches questions from database
5. System displays questions page
6. User fills in answers
7. User navigates to next question page (loop until complete)
8. System validates all questions answered
9. If incomplete → Show error message
10. If complete → Analyze answers with algorithm → Store results to database → Display results and recommendations

## Technical Stack

- **Frontend**: React + TypeScript, React Router, Axios, Chart.js (Radar chart)
- **Backend**: Express.js, Prisma ORM
- **Database**: PostgreSQL
- **State Management**: localStorage for session persistence
- **Assessment**: Holland RIASEC model with Fuzzy Logic matching algorithm

## Architecture Components

### Frontend Pages

1. **Tes Page** (`client/src/pages/user/Tes/index.tsx`)

   - Main landing page with test information
   - Display assessment history
   - Session management
   - Navigate to tutorial

2. **Tutorial Tes Page** (`client/src/pages/user/Tutorial Tes/index.tsx`)

   - Display tutorial instructions
   - Start button navigates to questions page

3. **Tes-Pertanyaan Page** (`client/src/pages/user/Tes-Pertanyaan/index.tsx`)

   - Display 60 questions with Likert scale (1-5)
   - Paginated display (10 questions per page)
   - Auto-save session to localStorage
   - Validation before submission
   - Submit to backend for analysis

4. **Tes-Hasil Page** (`client/src/pages/user/Tes-Hasil/index.tsx`)
   - Display Holland code (RIASEC)
   - Show radar chart of scores
   - Display personality description
   - Show top 20 program recommendations with match percentages

### Backend Components

1. **Holland Controller** (`server/src/controllers/hollandController.ts`)

   - `getQuestions()` - Retrieve 60 assessment questions
   - `submitAssessment()` - Process responses, calculate scores, analyze with algorithm
   - `getAssessmentHistory()` - Get user's past assessments
   - `getAssessmentResult()` - Get specific assessment result

2. **Fuzzy Logic Service** (`server/src/services/fuzzyLogicService.ts`)

   - Calculate match percentage between user scores and program requirements
   - Implements fuzzy logic algorithm for recommendation accuracy

3. **Database Models** (Prisma)
   - `HollandQuestion` - Assessment questions with holland_type
   - `HollandAssessment` - User assessment results with scores
   - `HollandProdiMapping` - Program study to Holland type mappings

## Sequence Diagram

````mermaid
sequenceDiagram
    participant User
    participant TesPage as TesPage<<view>>
    participant HasilTesPage as HasilTesPage<<view>>
    participant hollandController as hollandController<<controller>>
    participant fuzzyLogicService as fuzzyLogicService<<service>>
    participant HollandQuestion as HollandQuestion<<model>>
    participant HollandAssessment as HollandAssessment<<model>>
    participant HollandProdiMapping as HollandProdiMapping<<model>>

    Note over User,TesPage: Step 1-2: Access EDUPATH Main Page
    User->>TesPage: Access EDUPATH main page
    TesPage->>TesPage: Display EDUPATH main page

    Note over User,TesPage: Step 3-4: Click 'Tes' on Navigation Bar
    User->>TesPage: Click 'Tes' on navigation bar
    TesPage->>hollandController: getAssessmentHistory()
    hollandController->>HollandAssessment: findMany(user_id)
    HollandAssessment-->>hollandController: Return assessment list
    hollandController-->>TesPage: Return assessment history
    TesPage->>TesPage: Display Tes page with history

    Note over User,TesPage: Step 5-6: Click Tutorial Button
    User->>TesPage: Click '+' button (tutorial)
    TesPage->>TesPage: Display tutorial page

    Note over User,TesPage: Step 7-9: Start Test and Fetch Questions
    User->>TesPage: Click 'Mulai tes' button
    TesPage->>hollandController: getQuestions()
    hollandController->>HollandQuestion: findMany()
    HollandQuestion-->>hollandController: Return 60 questions
    hollandController-->>TesPage: Return questions data
    TesPage->>TesPage: shuffleArray(questions) - Fisher-Yates algorithm
    TesPage->>TesPage: Display questions page (page 1/6)

    Note over User,TesPage: Step 10-11: Fill Answers and Navigate Pages
    loop Questions not all answered
        User->>TesPage: Fill in answer (Likert 1-5)
        TesPage->>TesPage: handleAnswerChange(questionId, answerValue)
        TesPage->>TesPage: saveSession() - Auto-save to localStorage
        User->>TesPage: Navigate to next question page
        TesPage->>TesPage: handlePageChange(page)
        TesPage->>TesPage: scrollToTop()
    end

    Note over User,TesPage: Step 12-13: Validation Check
    User->>TesPage: Click "Selesai & Lihat Hasil"
    TesPage->>TesPage: validateAnswers() - Check 60 questions answered

    alt Not all questions answered
        TesPage->>TesPage: Display error message
        TesPage->>User: Alert "Mohon jawab semua pertanyaan terlebih dahulu"
    else All questions answered
        Note over TesPage,HollandProdiMapping: Step 14-16: Analyze, Store, and Display Results
        TesPage->>hollandController: submitAssessment(responses)
        hollandController->>hollandController: validateResponses(responses) - Check 60 answers, values 1-5
        hollandController->>hollandController: calculateScores(responses, questions)
        hollandController->>hollandController: getHollandCode(scores)

        hollandController->>hollandController: getRecommendations(scores)
        hollandController->>HollandProdiMapping: findMany()
        HollandProdiMapping-->>hollandController: Return prodi mappings

        loop For each program
            hollandController->>fuzzyLogicService: calculateMatchPercentage(userScores, prodiTypes)
            Note over fuzzyLogicService: Fuzzy Logic Tsukamoto Algorithm
            fuzzyLogicService->>fuzzyLogicService: fuzzifyScore(primaryScore) - Step 1: Fuzzification
            fuzzyLogicService->>fuzzyLogicService: fuzzifyScore(secondaryScore) - Convert crisp to fuzzy
            fuzzyLogicService->>fuzzyLogicService: getFuzzyRules() - Step 2: Get 9 fuzzy rules
            fuzzyLogicService->>fuzzyLogicService: inferenceEngine() - Step 3: Apply rules, calculate alpha
            fuzzyLogicService->>fuzzyLogicService: defuzzifyConsequent() - Step 4: Tsukamoto defuzzification
            fuzzyLogicService->>fuzzyLogicService: calculateWeightedAverage() - Step 5: Calculate z*
            fuzzyLogicService-->>hollandController: Return match percentage (0-100)
        end

        hollandController->>hollandController: sortRecommendations() - Get top 20
        hollandController->>HollandAssessment: create(scores, primary_type, secondary_type, holland_code)
        HollandAssessment-->>hollandController: Return assessment_id
        hollandController-->>TesPage: Return result with recommendations
        TesPage->>TesPage: clearSession() - Remove from localStorage

        TesPage->>HasilTesPage: navigate('/tes/hasil/:assessmentId')
        HasilTesPage->>HasilTesPage: Display results page
        HasilTesPage->>HasilTesPage: Display Holland code (e.g., "RIA")
        HasilTesPage->>HasilTesPage: renderRadarChart(scores) - 6 scores RIASEC
        HasilTesPage->>HasilTesPage: Display personality description
        HasilTesPage->>HasilTesPage: Display program recommendations (top 20 with match %)
    end
```## Data Flow Details

### 1. Session Management (localStorage)

```typescript
// Session Key
const SESSION_KEY = "holland_test_session";

// Session Structure
interface TestSession {
  questions: HollandQuestion[]; // Shuffled questions
  answers: Record<number, number>; // question_id → answer_value (1-5)
  currentPage: number; // Current pagination page
  timestamp: number; // Session start time
}

// Session Validity: 24 hours
// Auto-save: On every answer change or page navigation
// Clear: On successful submission
````

### 2. Question Display

- **Total Questions**: 60 (10 per Holland type: R, I, A, S, E, C)
- **Pagination**: 10 questions per page (6 pages total)
- **Order**: Randomized using Fisher-Yates shuffle algorithm
- **Answer Format**: Likert scale 1-5
  - 1 = Sangat Tidak Setuju
  - 2 = Tidak Setuju
  - 3 = Netral
  - 4 = Setuju
  - 5 = Sangat Setuju

### 3. Score Calculation

```typescript
// Raw scores calculated by summing answer values by holland_type
interface HollandScores {
  realistic: number; // Sum of 10 answers (range: 10-50)
  investigative: number; // Sum of 10 answers (range: 10-50)
  artistic: number; // Sum of 10 answers (range: 10-50)
  social: number; // Sum of 10 answers (range: 10-50)
  enterprising: number; // Sum of 10 answers (range: 10-50)
  conventional: number; // Sum of 10 answers (range: 10-50)
}
```

### 4. Holland Code Generation

```typescript
// Get top 3 types sorted by score
// Example: Realistic=45, Investigative=42, Artistic=38 → Code: "RIA"
// Primary: REALISTIC
// Secondary: INVESTIGATIVE
// Tertiary: ARTISTIC
```

### 5. Recommendation Algorithm

```typescript
// Uses Fuzzy Logic to calculate match percentage
// Inputs:
//   - User scores (RIASEC)
//   - Program primary_type
//   - Program secondary_type (optional)
// Output: Match percentage (0-100%)
// Returns: Top 20 programs sorted by match percentage
```

## API Endpoints

### GET `/api/holland/questions`

**Purpose**: Retrieve all 60 assessment questions

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "question_id": 1,
      "question_text": "Saya suka memperbaiki barang elektronik",
      "holland_type": "REALISTIC"
    }
    // ... 59 more questions
  ],
  "message": "Questions retrieved successfully"
}
```

### POST `/api/holland/submit`

**Purpose**: Submit assessment responses and get analysis

**Request Body**:

```json
{
  "responses": [
    {
      "question_id": 1,
      "answer_value": 4
    }
    // ... 59 more responses (total 60)
  ]
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "assessment_id": 123,
    "scores": {
      "realistic": 42,
      "investigative": 38,
      "artistic": 35,
      "social": 30,
      "enterprising": 28,
      "conventional": 25
    },
    "primary_type": "REALISTIC",
    "secondary_type": "INVESTIGATIVE",
    "tertiary_type": "ARTISTIC",
    "holland_code": "RIA",
    "recommendations": [
      {
        "prodi_id": 456,
        "nama_prodi": "Teknik Mesin",
        "jenjang": "S1",
        "match_percentage": 92.5,
        "rank": 1,
        "primary_type": "REALISTIC",
        "secondary_type": "INVESTIGATIVE"
      }
      // ... 19 more recommendations
    ]
  },
  "message": "Assessment submitted successfully"
}
```

### GET `/api/holland/history`

**Purpose**: Get user's past assessment results

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "assessment_id": 123,
      "holland_code": "RIA",
      "primary_type": "REALISTIC",
      "secondary_type": "INVESTIGATIVE",
      "completed_at": "2024-01-15T10:30:00Z"
    }
    // ... more assessments
  ]
}
```

### GET `/api/holland/result/:assessmentId`

**Purpose**: Get specific assessment result with recommendations

**Response**: Same format as submit response

## Key Features

### 1. Session Persistence

- Automatically saves progress to localStorage
- Restores session on page reload (within 24 hours)
- Shows notification when session is restored
- Clears session after successful submission

### 2. Progress Tracking

- Visual progress bar showing answered questions
- Page indicator (e.g., "Halaman 1 dari 6")
- Question counter (e.g., "Pertanyaan 1-10 dari 60")
- Button state changes based on completion

### 3. Validation

- Client-side: Check all 60 questions answered before submit
- Server-side: Validate exactly 60 responses with values 1-5
- Error handling with user-friendly messages

### 4. Navigation

- Pagination with previous/next controls
- Back button with confirmation (saves progress)
- Auto-scroll to top on page change
- Disabled submit button until all answered

### 5. Results Display

- Holland code (3-letter code)
- Radar chart visualization (Chart.js)
- Primary and secondary personality descriptions
- Top 20 program recommendations with match percentages
- Color-coded by Holland type

## Database Schema

### HollandQuestion

```prisma
model HollandQuestion {
  question_id   Int         @id @default(autoincrement())
  question_text String
  holland_type  HollandType
}

enum HollandType {
  REALISTIC
  INVESTIGATIVE
  ARTISTIC
  SOCIAL
  ENTERPRISING
  CONVENTIONAL
}
```

### HollandAssessment

```prisma
model HollandAssessment {
  assessment_id        Int         @id @default(autoincrement())
  user_id             Int
  realistic_score     Int
  investigative_score Int
  artistic_score      Int
  social_score        Int
  enterprising_score  Int
  conventional_score  Int
  primary_type        HollandType
  secondary_type      HollandType?
  holland_code        String      // e.g., "RIA"
  completed_at        DateTime    @default(now())
}
```

### HollandProdiMapping

```prisma
model HollandProdiMapping {
  mapping_id     Int          @id @default(autoincrement())
  prodi_id       Int
  primary_type   HollandType
  secondary_type HollandType?
  prodi          Prodi        @relation(fields: [prodi_id], references: [prodi_id])
}
```

## User Experience Flow

1. **Landing** → User sees test info, benefits, and past results
2. **Tutorial** → User reads instructions before starting
3. **Questions** → User answers 60 questions across 6 pages with auto-save
4. **Validation** → System checks all answered before allowing submission
5. **Analysis** → Backend calculates scores and matches with programs using fuzzy logic
6. **Results** → User sees personality profile and top 20 program recommendations

## Error Handling

### Client-Side

- Loading states with spinner during API calls
- Error messages for failed API requests
- Validation alerts for incomplete forms
- Session expiry handling (24 hours)

### Server-Side

- Authentication validation (JWT token)
- Request validation (60 responses, values 1-5)
- Database error handling
- Graceful error responses with messages

## Performance Optimizations

1. **Question Shuffling**: Client-side Fisher-Yates algorithm
2. **Session Caching**: localStorage reduces API calls
3. **Pagination**: Only render 10 questions at a time
4. **Lazy Loading**: Chart.js loaded only on results page
5. **Database Indexing**: Optimized queries with Prisma

---

**Last Updated**: 2024-01-15  
**Version**: 1.0  
**Related Diagrams**: Activity Diagram - Melakukan Tes Minat Bakat
