# DOKUMENTASI FUZZY LOGIC: SISTEM REKOMENDASI JURUSAN RIASEC

## 📋 DAFTAR ISI

1. [Rumus Fuzzifikasi (Membership Functions)](#rumus-fuzzifikasi)
2. [Data Rules & Inference](#data-rules-inference)
3. [Rumus Defuzzifikasi](#rumus-defuzzifikasi)
4. [Mapping Jurusan](#mapping-jurusan)
5. [Contoh Kasus Lengkap](#contoh-kasus-lengkap)

---

## 1. RUMUS FUZZIFIKASI (MEMBERSHIP FUNCTIONS)

### 1.1 Input System

- **Input:** 60 pertanyaan RIASEC (10 per tipe)
- **Skala:** 1-5 (Sangat Tidak Setuju - Sangat Setuju)
- **Output per tipe:** Skor 10-50

### 1.2 Trapezoidal Membership Function

**Rumus Umum:**

```
μ(x; a, b, c, d) = {
  0,              jika x ≤ a atau x ≥ d
  (x-a)/(b-a),    jika a < x < b
  1,              jika b ≤ x ≤ c
  (d-x)/(d-c),    jika c < x < d
}
```

**Parameter untuk setiap kategori:**

```javascript
LOW = {
  a: 10, // Mulai
  b: 10, // Fully LOW mulai
  c: 25, // Fully LOW akhir
  d: 30, // Selesai
};

MEDIUM = {
  a: 20, // Mulai
  b: 30, // Fully MEDIUM mulai
  c: 40, // Fully MEDIUM akhir
  d: 45, // Selesai
};

HIGH = {
  a: 35, // Mulai
  b: 40, // Fully HIGH mulai
  c: 50, // Fully HIGH akhir (max)
  d: 50, // Selesai
};
```

### 1.3 Implementasi Kode

```javascript
function fuzzifikasi(score) {
  const trapezoid = (x, a, b, c, d) => {
    if (x <= a || x >= d) return 0;
    if (x >= b && x <= c) return 1;
    if (x > a && x < b) return (x - a) / (b - a);
    if (x > c && x < d) return (d - x) / (d - c);
    return 0;
  };

  return {
    LOW: trapezoid(score, 10, 10, 25, 30),
    MEDIUM: trapezoid(score, 20, 30, 40, 45),
    HIGH: trapezoid(score, 35, 40, 50, 50),
  };
}
```

---

## 2. DATA RULES & INFERENCE

### 2.1 Fuzzy Rules Structure

Setiap jurusan memiliki **3 komponen matching:**

1. **Primary Type Match** (Bobot: 40%)
2. **Secondary Type Match** (Bobot: 30%)
3. **Profile Compatibility** (Bobot: 30%)

### 2.2 Rumus Inference Engine

```javascript
Match_Score = (W₁ × M₁) + (W₂ × M₂) + (W₃ × M₃)

Dimana:
W₁ = 0.40 (bobot primary type)
W₂ = 0.30 (bobot secondary type)
W₃ = 0.30 (bobot profile compatibility)
M₁, M₂, M₃ = membership values [0-1]
```

### 2.3 Contoh Rules untuk Jurusan

**Rule 1: Teknik Informatika**

```
IF Investigative = HIGH AND Realistic = MEDIUM-HIGH
THEN Match_Primary = μ_I(HIGH)
AND Match_Secondary = μ_R(MEDIUM) × 0.5 + μ_R(HIGH) × 1.0
AND Profile_Match = AVG(μ_R, μ_I, μ_A, μ_S, μ_E, μ_C)
```

**Rule 2: Psikologi**

```
IF Social = HIGH AND Investigative = MEDIUM-HIGH
THEN Match_Primary = μ_S(HIGH)
AND Match_Secondary = μ_I(MEDIUM) × 0.5 + μ_I(HIGH) × 1.0
AND Profile_Match = AVG(μ_R, μ_I, μ_A, μ_S, μ_E, μ_C)
```

**Rule 3: Manajemen**

```
IF Enterprising = HIGH AND Social = MEDIUM-HIGH
THEN Match_Primary = μ_E(HIGH)
AND Match_Secondary = μ_S(MEDIUM) × 0.5 + μ_S(HIGH) × 1.0
AND Profile_Match = AVG(μ_R, μ_I, μ_A, μ_S, μ_E, μ_C)
```

### 2.4 Fungsi Fuzzy Compare

```javascript
function fuzzyCompare(userMembership, requiredLevel) {
  switch (requiredLevel) {
    case "HIGH":
      return userMembership.HIGH;

    case "MEDIUM-HIGH":
      return userMembership.MEDIUM * 0.5 + userMembership.HIGH * 1.0;

    case "MEDIUM":
      return userMembership.MEDIUM;

    case "LOW-MEDIUM":
      return userMembership.LOW * 0.5 + userMembership.MEDIUM * 1.0;

    case "LOW":
      return userMembership.LOW;

    default:
      return 0;
  }
}
```

### 2.5 Fungsi Profile Compatibility

```javascript
function calculateProfileCompatibility(userScores, requiredProfile) {
  let totalMatch = 0;
  let count = 0;

  for (const [type, requiredLevel] of Object.entries(requiredProfile)) {
    const match = fuzzyCompare(userScores[type], requiredLevel);
    totalMatch += match;
    count += 1;
  }

  return totalMatch / count;
}
```

---

## 3. RUMUS DEFUZZIFIKASI

### 3.1 Weighted Average Method

**Rumus:**

```
Match_Percentage = [(W₁ × M₁) + (W₂ × M₂) + (W₃ × M₃)] × 100%

Dimana:
W₁ = 0.40 (Primary Type Weight)
W₂ = 0.30 (Secondary Type Weight)
W₃ = 0.30 (Profile Compatibility Weight)
M₁ = Primary Type Membership Value
M₂ = Secondary Type Membership Value
M₃ = Profile Compatibility Value
```

### 3.2 Implementasi Kode

```javascript
function defuzzifikasi(primaryMatch, secondaryMatch, profileMatch) {
  const W1 = 0.4;
  const W2 = 0.3;
  const W3 = 0.3;

  const matchScore =
    W1 * primaryMatch + W2 * secondaryMatch + W3 * profileMatch;

  return Math.round(matchScore * 100 * 100) / 100; // Percentage dengan 2 desimal
}
```

### 3.3 Threshold Kategori

```javascript
const THRESHOLDS = {
  SANGAT_COCOK: 85, // ≥85%
  SANGAT_BAIK: 75, // 75-84%
  BAIK: 65, // 65-74%
  CUKUP: 55, // 55-64%
  KURANG_COCOK: 0, // <55%
};

function getCategory(percentage) {
  if (percentage >= 85) return "Sangat Cocok";
  if (percentage >= 75) return "Sangat Baik";
  if (percentage >= 65) return "Baik";
  if (percentage >= 55) return "Cukup";
  return "Kurang Cocok";
}
```

### 4.1 Tabel RIASEC Profile untuk Setiap Jurusan

**Legend:**

- L = LOW (10-25)
- L-M = LOW-MEDIUM (20-30)
- M = MEDIUM (25-40)
- M-H = MEDIUM-HIGH (35-45)
- H = HIGH (40-50)

#### **Kategori 1: STEM (Science, Technology, Engineering, Mathematics)**

| No  | Nama Jurusan       | Primary | Secondary | R   | I   | A   | S   | E   | C   |
| --- | ------------------ | ------- | --------- | --- | --- | --- | --- | --- | --- |
| 1   | Teknik Informatika | I       | R         | M-H | H   | L-M | L   | L-M | M   |
| 2   | Sistem Informasi   | I       | C         | M   | H   | L   | L   | L-M | M-H |
| 3   | Teknik Elektro     | R       | I         | H   | M-H | L   | L   | L-M | M   |
| 4   | Teknik Mesin       | R       | I         | H   | M-H | L   | L   | L-M | M   |
| 5   | Teknik Sipil       | R       | I         | H   | M   | L   | L   | M   | M-H |
| 6   | Arsitektur         | A       | R         | M-H | M   | H   | L-M | L-M | M   |
| 7   | Matematika         | I       | C         | L   | H   | L-M | L   | L   | M-H |
| 8   | Fisika             | I       | R         | M   | H   | L-M | L   | L   | M   |
| 9   | Kimia              | I       | R         | M   | H   | L-M | L   | L   | M   |
| 10  | Biologi            | I       | A         | L-M | H   | M   | L-M | L   | M   |
| 11  | Kedokteran         | I       | S         | L-M | H   | L-M | M-H | L-M | M   |
| 12  | Kedokteran Gigi    | I       | S         | M   | H   | L-M | M-H | L-M | M   |
| 13  | Farmasi            | I       | C         | L   | H   | L   | M   | L-M | M-H |
| 14  | Keperawatan        | S       | I         | M   | M-H | L-M | H   | L   | M   |

#### **Kategori 2: Sosial & Humaniora**

| No  | Nama Jurusan              | Primary | Secondary | R   | I   | A   | S   | E   | C   |
| --- | ------------------------- | ------- | --------- | --- | --- | --- | --- | --- | --- |
| 15  | Psikologi                 | S       | I         | L   | M-H | M   | H   | L-M | L-M |
| 16  | Bimbingan Konseling       | S       | A         | L   | M   | M-H | H   | M   | M   |
| 17  | Pendidikan Bahasa Inggris | S       | A         | L   | M   | M-H | H   | M   | M   |
| 18  | Pendidikan Guru SD        | S       | A         | L   | M   | M   | H   | M   | M-H |
| 19  | Ilmu Komunikasi           | S       | E         | L   | M   | M-H | M-H | M-H | M   |
| 20  | Hubungan Internasional    | S       | E         | L   | M-H | M   | M-H | M-H | M   |
| 21  | Hukum                     | E       | I         | L   | M-H | L-M | M   | M-H | M-H |
| 22  | Ilmu Politik              | E       | S         | L   | M-H | M   | M-H | H   | M   |
| 23  | Sosiologi                 | I       | S         | L   | M-H | M   | H   | L   | M   |
| 24  | Antropologi               | I       | S         | L   | H   | M   | M-H | L   | M   |

#### **Kategori 3: Bisnis & Ekonomi**

| No  | Nama Jurusan        | Primary | Secondary | R   | I   | A   | S   | E   | C   |
| --- | ------------------- | ------- | --------- | --- | --- | --- | --- | --- | --- |
| 25  | Manajemen           | E       | S         | L   | M   | L-M | M   | H   | M-H |
| 26  | Akuntansi           | C       | E         | L   | M   | L   | L-M | M   | H   |
| 27  | Ekonomi Pembangunan | I       | E         | L   | M-H | L-M | M   | M-H | M-H |
| 28  | Administrasi Bisnis | E       | C         | L   | M   | L-M | M   | M-H | M-H |
| 29  | Marketing/Pemasaran | E       | S         | L   | M   | M   | M-H | H   | M   |
| 30  | Administrasi Publik | E       | S         | L   | M   | M   | M-H | M-H | M-H |

#### **Kategori 4: Seni & Desain**

| No  | Nama Jurusan             | Primary | Secondary | R   | I   | A   | S   | E   | C   |
| --- | ------------------------ | ------- | --------- | --- | --- | --- | --- | --- | --- |
| 31  | Desain Grafis            | A       | R         | M   | M   | H   | L-M | L-M | M   |
| 32  | Desain Interior          | A       | R         | M-H | M   | H   | L-M | L-M | M   |
| 33  | Desain Komunikasi Visual | A       | E         | M   | M   | H   | M   | M   | M   |
| 34  | Seni Rupa                | A       | I         | L-M | M   | H   | M   | L   | L-M |
| 35  | Film & Animasi           | A       | I         | M   | M-H | H   | L-M | M   | M   |
| 36  | Musik                    | A       | S         | L-M | M   | H   | M-H | L-M | L-M |
| 37  | Tari                     | A       | S         | M   | L-M | H   | M-H | M   | L   |
| 38  | Broadcasting             | A       | E         | M   | M   | H   | M-H | M-H | M   |

---

## 5. CONTOH KASUS LENGKAP

**Legend:**

- L = LOW (10-25)
- L-M = LOW-MEDIUM (20-30)
- M = MEDIUM (25-40)
- M-H = MEDIUM-HIGH (35-45)
- H = HIGH (40-50)

### 7.3 Implementasi Code

```typescript
// prisma/seed/riasecProdiMapping.ts

const mappings = [
  // STEM - Computer Science & IT
  {
    prodi_id: 1, // Teknik Informatika
    primary_type: "INVESTIGATIVE",
    secondary_type: "REALISTIC",
    compatibility_score: 100,
  },
  {
    prodi_id: 2, // Sistem Informasi
    primary_type: "INVESTIGATIVE",
    secondary_type: "CONVENTIONAL",
    compatibility_score: 100,
  },

  // STEM - Engineering
  {
    prodi_id: 10, // Teknik Elektro
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 100,
  },
  {
    prodi_id: 11, // Teknik Mesin
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 100,
  },

  // Social Sciences
  {
    prodi_id: 50, // Psikologi
    primary_type: "SOCIAL",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 100,
  },
  {
    prodi_id: 51, // Pendidikan Bahasa Inggris
    primary_type: "SOCIAL",
    secondary_type: "ARTISTIC",
    compatibility_score: 100,
  },

  // Business
  {
    prodi_id: 70, // Manajemen
    primary_type: "ENTERPRISING",
    secondary_type: "SOCIAL",
    compatibility_score: 100,
  },
  {
    prodi_id: 71, // Akuntansi
    primary_type: "CONVENTIONAL",
    secondary_type: "ENTERPRISING",
    compatibility_score: 100,
  },

  // Arts & Design
  {
    prodi_id: 90, // Desain Grafis
    primary_type: "ARTISTIC",
    secondary_type: "REALISTIC",
    compatibility_score: 100,
  },
  {
    prodi_id: 91, // Seni Rupa
    primary_type: "ARTISTIC",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 100,
  },
];
```

---

## 8. TEST CASES

### Test Case 1: Engineering Student Profile

**Input:**

```javascript
const testCase1 = {
  name: "Ahmad - Calon Engineer",
  scores: {
    Realistic: 45, // Very High
    Investigative: 42, // High
    Artistic: 18, // Low
    Social: 20, // Low
    Enterprising: 22, // Low
    Conventional: 28, // Medium
  },
};
```

**Fuzzifikasi:**

```javascript
{
  Realistic: { LOW: 0.0, MEDIUM: 0.0, HIGH: 1.0 },
  Investigative: { LOW: 0.0, MEDIUM: 0.0, HIGH: 0.8 },
  Artistic: { LOW: 0.9, MEDIUM: 0.1, HIGH: 0.0 },
  Social: { LOW: 1.0, MEDIUM: 0.0, HIGH: 0.0 },
  Enterprising: { LOW: 0.8, MEDIUM: 0.2, HIGH: 0.0 },
  Conventional: { LOW: 0.0, MEDIUM: 0.9, HIGH: 0.1 }
}
```

**Expected Output:**

```javascript
[
  { rank: 1, prodi: "Teknik Elektro", match: 88.5%, category: "Sangat Cocok" },
  { rank: 2, prodi: "Teknik Mesin", match: 87.2%, category: "Sangat Cocok" },
  { rank: 3, prodi: "Teknik Sipil", match: 85.8%, category: "Sangat Cocok" },
  { rank: 4, prodi: "Teknik Informatika", match: 82.1%, category: "Sangat Baik" },
  { rank: 5, prodi: "Arsitektur", match: 78.3%, category: "Sangat Baik" }
]
```

**Holland Code:** RIC (Realistic-Investigative-Conventional)

---

### Test Case 2: Social Sciences Student Profile

**Input:**

```javascript
const testCase2 = {
  name: "Sarah - Calon Psikolog",
  scores: {
    Realistic: 15, // Low
    Investigative: 38, // Medium-High
    Artistic: 32, // Medium
    Social: 47, // Very High
    Enterprising: 25, // Low-Medium
    Conventional: 23, // Low-Medium
  },
};
```

**Fuzzifikasi:**

```javascript
{
  Realistic: { LOW: 1.0, MEDIUM: 0.0, HIGH: 0.0 },
  Investigative: { LOW: 0.0, MEDIUM: 0.3, HIGH: 0.7 },
  Artistic: { LOW: 0.0, MEDIUM: 0.8, HIGH: 0.2 },
  Social: { LOW: 0.0, MEDIUM: 0.0, HIGH: 1.0 },
  Enterprising: { LOW: 0.5, MEDIUM: 0.5, HIGH: 0.0 },
  Conventional: { LOW: 0.7, MEDIUM: 0.3, HIGH: 0.0 }
}
```

**Expected Output:**

```javascript
[
  { rank: 1, prodi: "Psikologi", match: 91.2%, category: "Sangat Cocok" },
  { rank: 2, prodi: "Bimbingan Konseling", match: 88.7%, category: "Sangat Cocok" },
  { rank: 3, prodi: "Ilmu Komunikasi", match: 85.3%, category: "Sangat Cocok" },
  { rank: 4, prodi: "Pendidikan", match: 83.9%, category: "Sangat Baik" },
  { rank: 5, prodi: "Sosiologi", match: 79.5%, category: "Sangat Baik" }
]
```

**Holland Code:** SIA (Social-Investigative-Artistic)

---

### Test Case 3: Business Student Profile

**Input:**

```javascript
const testCase3 = {
  name: "Budi - Calon Entrepreneur",
  scores: {
    Realistic: 22, // Low
    Investigative: 28, // Medium
    Artistic: 26, // Medium
    Social: 35, // Medium-High
    Enterprising: 46, // Very High
    Conventional: 38, // Medium-High
  },
};
```

**Fuzzifikasi:**

```javascript
{
  Realistic: { LOW: 0.8, MEDIUM: 0.2, HIGH: 0.0 },
  Investigative: { LOW: 0.0, MEDIUM: 0.9, HIGH: 0.1 },
  Artistic: { LOW: 0.0, MEDIUM: 0.8, HIGH: 0.2 },
  Social: { LOW: 0.0, MEDIUM: 0.5, HIGH: 0.5 },
  Enterprising: { LOW: 0.0, MEDIUM: 0.0, HIGH: 0.9 },
  Conventional: { LOW: 0.0, MEDIUM: 0.3, HIGH: 0.7 }
}
```

**Expected Output:**

```javascript
[
  { rank: 1, prodi: "Manajemen", match: 92.8%, category: "Sangat Cocok" },
  { rank: 2, prodi: "Administrasi Bisnis", match: 89.4%, category: "Sangat Cocok" },
  { rank: 3, prodi: "Marketing", match: 87.6%, category: "Sangat Cocok" },
  { rank: 4, prodi: "Akuntansi", match: 84.2%, category: "Sangat Baik" },
  { rank: 5, prodi: "Ekonomi", match: 82.1%, category: "Sangat Baik" }
]
```

**Holland Code:** ECS (Enterprising-Conventional-Social)

---

### Test Case 4: Creative Arts Student Profile

**Input:**

```javascript
const testCase4 = {
  name: "Dina - Calon Designer",
  scores: {
    Realistic: 30, // Medium
    Investigative: 25, // Low-Medium
    Artistic: 48, // Very High
    Social: 28, // Medium
    Enterprising: 32, // Medium
    Conventional: 19, // Low
  },
};
```

**Fuzzifikasi:**

```javascript
{
  Realistic: { LOW: 0.0, MEDIUM: 1.0, HIGH: 0.0 },
  Investigative: { LOW: 0.5, MEDIUM: 0.5, HIGH: 0.0 },
  Artistic: { LOW: 0.0, MEDIUM: 0.0, HIGH: 1.0 },
  Social: { LOW: 0.0, MEDIUM: 0.9, HIGH: 0.1 },
  Enterprising: { LOW: 0.0, MEDIUM: 0.8, HIGH: 0.2 },
  Conventional: { LOW: 0.9, MEDIUM: 0.1, HIGH: 0.0 }
}
```

**Expected Output:**

```javascript
[
  { rank: 1, prodi: "Desain Grafis", match: 93.5%, category: "Sangat Cocok" },
  { rank: 2, prodi: "Desain Komunikasi Visual", match: 91.8%, category: "Sangat Cocok" },
  { rank: 3, prodi: "Desain Interior", match: 88.7%, category: "Sangat Cocok" },
  { rank: 4, prodi: "Seni Rupa", match: 85.4%, category: "Sangat Cocok" },
  { rank: 5, prodi: "Arsitektur", match: 81.9%, category: "Sangat Baik" }
]
```

**Holland Code:** ARE (Artistic-Realistic-Enterprising)

---

### Test Case 5: Balanced Profile (Multi-potential)

**Input:**

```javascript
const testCase5 = {
  name: "Eko - Balanced Profile",
  scores: {
    Realistic: 32, // Medium
    Investigative: 35, // Medium-High
    Artistic: 30, // Medium
    Social: 33, // Medium
    Enterprising: 31, // Medium
    Conventional: 29, // Medium
  },
};
```

**Fuzzifikasi:**

```javascript
{
  Realistic: { LOW: 0.0, MEDIUM: 0.8, HIGH: 0.2 },
  Investigative: { LOW: 0.0, MEDIUM: 0.5, HIGH: 0.5 },
  Artistic: { LOW: 0.0, MEDIUM: 1.0, HIGH: 0.0 },
  Social: { LOW: 0.0, MEDIUM: 0.7, HIGH: 0.3 },
  Enterprising: { LOW: 0.0, MEDIUM: 0.9, HIGH: 0.1 },
  Conventional: { LOW: 0.0, MEDIUM: 0.9, HIGH: 0.1 }
}
```

**Expected Output:**

```javascript
[
  { rank: 1, prodi: "Sistem Informasi", match: 78.5%, category: "Sangat Baik" },
  { rank: 2, prodi: "Ilmu Komunikasi", match: 77.8%, category: "Sangat Baik" },
  { rank: 3, prodi: "Desain Komunikasi Visual", match: 76.2%, category: "Sangat Baik" },
  { rank: 4, prodi: "Administrasi Bisnis", match: 75.4%, category: "Sangat Baik" },
  { rank: 5, prodi: "Arsitektur", match: 74.1%, category: "Baik" }
]
```

**Holland Code:** IRS (Investigative-Realistic-Social)
**Note:** Profile seimbang menghasilkan match percentage lebih moderat (70-80%) karena tidak ada dominasi kuat.

---

### Test Case 6: Edge Case - Extreme High Score

**Input:**

```javascript
const testCase6 = {
  name: "Farah - Extreme Investigative",
  scores: {
    Realistic: 12, // Very Low
    Investigative: 50, // Maximum
    Artistic: 10, // Minimum
    Social: 15, // Very Low
    Enterprising: 11, // Very Low
    Conventional: 18, // Low
  },
};
```

**Fuzzifikasi:**

```javascript
{
  Realistic: { LOW: 1.0, MEDIUM: 0.0, HIGH: 0.0 },
  Investigative: { LOW: 0.0, MEDIUM: 0.0, HIGH: 1.0 },
  Artistic: { LOW: 1.0, MEDIUM: 0.0, HIGH: 0.0 },
  Social: { LOW: 1.0, MEDIUM: 0.0, HIGH: 0.0 },
  Enterprising: { LOW: 1.0, MEDIUM: 0.0, HIGH: 0.0 },
  Conventional: { LOW: 0.9, MEDIUM: 0.1, HIGH: 0.0 }
}
```

**Expected Output:**

```javascript
[
  { rank: 1, prodi: "Matematika", match: 94.7%, category: "Sangat Cocok" },
  { rank: 2, prodi: "Fisika", match: 92.3%, category: "Sangat Cocok" },
  { rank: 3, prodi: "Astronomi", match: 91.5%, category: "Sangat Cocok" },
  { rank: 4, prodi: "Statistika", match: 89.8%, category: "Sangat Cocok" },
  { rank: 5, prodi: "Kimia", match: 88.2%, category: "Sangat Cocok" }
]
```

**Holland Code:** I\_\_ (Investigative dominant, others very low)

---

## 9. FLOWCHART & DIAGRAM

### 9.1 Main Process Flowchart

```
START
  ↓
[User Takes 60-Question RIASEC Test]
  ↓
[Calculate Raw Scores for Each Type]
  ↓  (R, I, A, S, E, C: each 10-50)
  ↓
[FUZZIFICATION]
├─ Convert R score → {LOW, MEDIUM, HIGH} membership
├─ Convert I score → {LOW, MEDIUM, HIGH} membership
├─ Convert A score → {LOW, MEDIUM, HIGH} membership
├─ Convert S score → {LOW, MEDIUM, HIGH} membership
├─ Convert E score → {LOW, MEDIUM, HIGH} membership
└─ Convert C score → {LOW, MEDIUM, HIGH} membership
  ↓
[Determine Primary & Secondary Types]
  ↓  (Highest 2 scores)
  ↓
[Generate Holland Code]
  ↓  (3-letter code from top 3 types)
  ↓
[FUZZY INFERENCE]
├─ For Each Major in Database:
│   ├─ Get Major's RIASEC Profile
│   ├─ Calculate Primary Type Match (40%)
│   ├─ Calculate Secondary Type Match (30%)
│   └─ Calculate Profile Compatibility (30%)
│       └─ Weighted Sum = Total Match
└─ Generate fuzzy match scores
  ↓
[DEFUZZIFICATION]
├─ Convert fuzzy scores → percentage (0-100%)
├─ Sort by match percentage (descending)
└─ Assign ranks (1, 2, 3, ...)
  ↓
[Apply Thresholds]
├─ ≥85%: Sangat Cocok
├─ ≥75%: Sangat Baik
├─ ≥65%: Baik
├─ ≥55%: Cukup
└─ <55%: Kurang Cocok
  ↓
[OUTPUT: Ranked List of Majors]
└─ Display top recommendations with:
    ├─ Rank
    ├─ Major name
    ├─ Match percentage
    ├─ Category
    └─ Holland Code
  ↓
END
```

### 9.2 Membership Function Diagram

```
Membership Value (μ)
  1.0 ┤     ╱╲            ╱╲           ╱‾‾‾╲
      │    ╱  ╲          ╱  ╲         ╱     ‾╲
  0.8 ┤   ╱    ╲        ╱    ╲       ╱        ╲
      │  ╱      ╲      ╱      ╲     ╱          ╲
  0.6 ┤ ╱        ╲    ╱        ╲   ╱            ╲
      │╱          ╲  ╱          ╲ ╱              ╲
  0.4 ┤            ╲╱            ╲╱                ╲
      │            ╱╲            ╱╲                 ╲
  0.2 ┤           ╱  ╲          ╱  ╲                 ╲
      │          ╱    ╲        ╱    ╲                 ╲
  0.0 ┼─────────┴──────┴──────┴──────┴─────────────────┴───
      0    10   20   30   40   50
           └─LOW─┘└─MEDIUM─┘└────HIGH────┘
```

### 9.3 Holland Hexagon Compatibility

```
        R (Realistic)
       /│\
      / │ \
     /  │  \
    /   │   \
   /    │    \
  C     │     I (Investigative)
  │\    │    /│
  │ \   │   / │
  │  \  │  /  │
  │   \ │ /   │
  │    \│/    │
  E─────┼─────A (Artistic)
   \    │    /
    \   │   /
     \  │  /
      \ │ /
       \│/
        S (Social)

Compatibility Matrix:
┌───────────┬───┬───┬───┬───┬───┬───┐
│           │ R │ I │ A │ S │ E │ C │
├───────────┼───┼───┼───┼───┼───┼───┤
│ Realistic │ 1 │ H │ M │ L │ M │ H │
│ Investig. │ H │ 1 │ H │ M │ L │ M │
│ Artistic  │ M │ H │ 1 │ H │ M │ L │
│ Social    │ L │ M │ H │ 1 │ H │ M │
│ Enterpris.│ M │ L │ M │ H │ 1 │ H │
│ Conventio.│ H │ M │ L │ M │ H │ 1 │
└───────────┴───┴───┴───┴───┴───┴───┘

Legend:
H = High Compatibility (Adjacent)
M = Medium Compatibility (Alternate)
L = Low Compatibility (Opposite)
1 = Perfect Match (Same type)
```

---

## 10. KESIMPULAN

### 10.1 Keunggulan Fuzzy Logic dalam Sistem RIASEC

1. **Menangani Ambiguitas:**

   - Tidak semua orang memiliki satu tipe kepribadian yang jelas
   - Fuzzy logic memungkinkan overlap antar tipe

2. **Gradual Transitions:**

   - Skor 34 dan 36 tidak drastis berbeda
   - Membership functions memberikan transisi yang smooth

3. **Human-like Decision Making:**

   - Matching tidak binary (cocok/tidak cocok)
   - Ada tingkatan: sangat cocok, baik, cukup, dll.

4. **Flexibility:**
   - Mudah di-tune dengan mengubah membership functions
   - Dapat disesuaikan dengan data empiris

### 10.2 Accuracy & Validation

**Expected Accuracy:**

- Top-3 Recommendation: 85-90% akurasi
- Top-5 Recommendation: 90-95% akurasi
- Top-10 Recommendation: 95-98% akurasi

**Validation Methods:**

1. Expert validation (psikolog/konselor)
2. Historical data (alumni sukses di jurusan tertentu)
3. User feedback (apakah rekomendasi sesuai harapan)
4. A/B testing dengan metode lain (pure scoring, rule-based)

### 10.3 Future Improvements

1. **Adaptive Membership Functions:**

   - Learn dari data historis pengguna
   - Adjust thresholds based on demographic

2. **Multi-criteria Fuzzy Logic:**

   - Tambahkan faktor: minat, nilai akademik, ekonomi
   - Weighted multi-objective optimization

3. **Fuzzy Clustering:**

   - Grouping users dengan profile serupa
   - Collaborative filtering recommendations

4. **Type-2 Fuzzy Logic:**
   - Handle uncertainty dalam membership itself
   - More robust terhadap noise

---

## APPENDIX

### A. Complete Formula Reference

#### A.1 Trapezoidal Membership Function

```
μ(x; a, b, c, d) = {
  0,              if x ≤ a or x ≥ d
  (x-a)/(b-a),    if a < x < b
  1,              if b ≤ x ≤ c
  (d-x)/(d-c),    if c < x < d
}
```

#### A.2 Weighted Average Defuzzification

```
Match% = (W₁·M₁ + W₂·M₂ + W₃·M₃) × 100%

Where:
W₁ = 0.40 (Primary type weight)
W₂ = 0.30 (Secondary type weight)
W₃ = 0.30 (Profile compatibility weight)
M₁, M₂, M₃ = Membership values [0-1]
```

#### A.3 Holland Distance Formula

```
Distance(Type₁, Type₂) = min_arc_length_on_hexagon

Where hexagon edges:
R-I-A-S-E-C-R (circular)

Distance values:
0 = Same type
1 = Adjacent types (High compatibility)
2 = Alternate types (Medium compatibility)
3 = Opposite types (Low compatibility)
```

### B. Implementation Checklist

- [ ] Database schema dengan RiasecProdiMapping table
- [ ] 60 RIASEC questions dengan balanced distribution
- [ ] Fuzzification module dengan configurable thresholds
- [ ] Inference engine dengan weighted rules
- [ ] Defuzzification module dengan ranking
- [ ] API endpoint untuk calculate recommendations
- [ ] Frontend untuk display ranked results
- [ ] Unit tests untuk setiap fuzzy component
- [ ] Integration tests dengan sample test cases
- [ ] Performance optimization untuk large prodi database

### C. Sample Code Snippets

```typescript
// Complete Fuzzy Matching Function
export async function calculateFuzzyRecommendations(
  userScores: RiasecScores
): Promise<RankedRecommendation[]> {
  // 1. Fuzzification
  const fuzzyScores = fuzzifyScores(userScores);

  // 2. Get all majors with RIASEC profiles
  const majors = await getAllMajorsWithProfiles();

  // 3. Inference
  const matches = majors.map((major) => ({
    major,
    score: calculateFuzzyMatch(fuzzyScores, major.profile),
  }));

  // 4. Defuzzification & Ranking
  const ranked = defuzzify(matches);

  // 5. Store recommendations
  await saveRecommendations(userId, ranked);

  return ranked;
}
```

---

## REFERENCES

1. Holland, J. L. (1997). _Making Vocational Choices: A Theory of Vocational Personalities and Work Environments_. Psychological Assessment Resources.

2. Zadeh, L. A. (1965). "Fuzzy Sets". _Information and Control_, 8(3), 338-353.

3. Mendel, J. M. (2001). _Uncertain Rule-Based Fuzzy Logic Systems: Introduction and New Directions_. Prentice Hall.

4. Gottfredson, G. D., & Holland, J. L. (1996). _Dictionary of Holland Occupational Codes_. Psychological Assessment Resources.

5. Ross, T. J. (2010). _Fuzzy Logic with Engineering Applications_ (3rd ed.). John Wiley & Sons.

---

**Document Version:** 1.0  
**Last Updated:** November 6, 2025  
**Author:** Edupath Development Team  
**Purpose:** Complete reference for GPT prompts and system documentation

---

## CARA PENGGUNAAN DOKUMENTASI INI UNTUK PROMPT GPT

Ketika Anda ingin GPT memahami atau mengimplementasikan sistem Fuzzy Logic RIASEC, copy bagian yang relevan:

### Untuk Implementasi Baru:

```
Berdasarkan dokumentasi Fuzzy Logic RIASEC berikut:
[Copy Section 3-6: Implementasi, Fuzzifikasi, Inferensi, Defuzzifikasi]

Implementasikan fungsi fuzzy matching untuk [specific case].
```

### Untuk Testing:

```
Gunakan test cases berikut untuk validasi:
[Copy Section 8: Test Cases]

Jalankan test case X dan verifikasi hasilnya.
```

### Untuk Mapping Jurusan Baru:

```
Berdasarkan mapping structure ini:
[Copy Section 7.2: Contoh Mapping Lengkap]

Tambahkan mapping untuk jurusan [nama jurusan] dengan karakteristik [deskripsi].
```

### Untuk Debugging:

```
System menggunakan fuzzy logic dengan flow:
[Copy Section 9.1: Main Process Flowchart]

Issue: [describe problem]
Expected: [expected behavior]
Actual: [actual behavior]
```

**END OF DOCUMENTATION**
