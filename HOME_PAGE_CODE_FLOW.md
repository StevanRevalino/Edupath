# Home Page Code Flow

## 1. Page Initialization (Home/index.tsx)

### State Management

```typescript
// User data state
const [user, setUser] = useState<User | null>(null);

// Prodi/Jurusan data state
const [allMajors, setAllMajors] = useState<string[]>([]);
const [majorsLoading, setMajorsLoading] = useState(true);

// Universitas data state
const [allUniversities, setAllUniversities] = useState<string[]>([]);
const [universitiesLoading, setUniversitiesLoading] = useState(true);

// Holland Assessment data state
const [assessmentStats, setAssessmentStats] = useState<{
  totalTests: number;
  lastTestDate: string | null;
  topRecommendation: {
    major: string;
    percentage: number;
  } | null;
  latestTestDetails: {
    scores: {
      realistic: number;
      investigative: number;
      artistic: number;
      social: number;
      enterprising: number;
      conventional: number;
    } | null;
    recommendations: Array<{
      nama_prodi: string;
      match_percentage: number;
      jenjang: string | null;
    }>;
    completed_at: string | null;
  } | null;
  allTests: Array<{
    assessment_id: string;
    completed_at: string;
    dominant_type: string;
  }>;
}>({
  totalTests: 0,
  lastTestDate: null,
  topRecommendation: null,
  latestTestDetails: null,
  allTests: [],
});
const [assessmentLoading, setAssessmentLoading] = useState(true);

// Search queries
const [searchQuery, setSearchQuery] = useState("");
const [universitySearchQuery, setUniversitySearchQuery] = useState("");
```

## 2. Data Fetching Flow

### 2.1 Fetch User Data

```typescript
useEffect(() => {
  const fetchUserData = async () => {
    try {
      const userData = await userHanndler.getUserById();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  fetchUserData();
}, [navigate]);
```

**Step:**

1. Call `userHanndler.getUserById()`
2. Set `user` state dengan data yang diterima
3. Display user info di Hero Section (avatar, nama, kelas)

### 2.2 Fetch Prodi Data

```typescript
useEffect(() => {
  const fetchProdiData = async () => {
    try {
      const response = await prodiHandler.getAllProdi(679);
      if (response.success) {
        const prodiNames = response.data.map((prodi) => prodi.nama_prodi);
        setAllMajors(prodiNames);
      }
    } catch (error) {
      console.error("Error fetching prodi data:", error);
      setAllMajors([]);
    } finally {
      setMajorsLoading(false);
    }
  };

  fetchProdiData();
}, []);
```

**Step:**

1. Call `prodiHandler.getAllProdi(679)` - limit 679 items
2. Extract `nama_prodi` dari setiap prodi
3. Set `allMajors` state dengan array nama prodi
4. Set `majorsLoading = false`

### 2.3 Fetch Universitas Data

```typescript
useEffect(() => {
  const fetchUniversitasData = async () => {
    try {
      const response = await universitasHandler.getAllUniversitas(645);
      if (response.success) {
        const universitasNames = response.data.map((univ) => univ.nama);
        setAllUniversities(universitasNames);
      }
    } catch (error) {
      console.error("Error fetching universitas data:", error);
      setAllUniversities([]);
    } finally {
      setUniversitiesLoading(false);
    }
  };

  fetchUniversitasData();
}, []);
```

**Step:**

1. Call `universitasHandler.getAllUniversitas(645)` - limit 645 items
2. Extract `nama` dari setiap universitas
3. Set `allUniversities` state dengan array nama universitas
4. Set `universitiesLoading = false`

### 2.4 Fetch Holland Assessment Data

```typescript
useEffect(() => {
  const fetchAssessmentData = async () => {
    try {
      // Fetch assessment history
      const assessments = await hollandHandler.getAssessmentHistory();
      const assessmentsArray = assessments || [];
      const totalTests = assessments.length;

      if (totalTests > 0) {
        // Get the latest assessment (most recent)
        const latestAssessment = assessments[0]; // Assuming sorted by date desc
        const lastTestDate = latestAssessment.completed_at
          ? new Date(latestAssessment.completed_at).toLocaleDateString(
              "id-ID",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }
            )
          : null;

        // Fetch detailed result for latest assessment to get recommendations
        const result = await hollandHandler.getAssessmentResult(
          latestAssessment.assessment_id
        );

        const recommendations = result.recommendations || [];
        const scores = result.scores || null;

        // Get top recommendation (first one with highest score)
        const topRecommendation =
          recommendations.length > 0
            ? {
                major: recommendations[0].nama_prodi || "Belum ada data",
                percentage: Math.round(recommendations[0].match_percentage),
              }
            : null;

        setAssessmentStats({
          totalTests,
          lastTestDate,
          topRecommendation,
          latestTestDetails: {
            scores,
            recommendations: recommendations.slice(0, 5), // Top 5 recommendations
            completed_at: latestAssessment.completed_at,
          },
          allTests: assessmentsArray.map((a: any) => {
            // Combine primary and secondary type (e.g., "R + I")
            const primaryCode = a.primary_type
              ? a.primary_type.charAt(0).toUpperCase()
              : "";
            const secondaryCode = a.secondary_type
              ? a.secondary_type.charAt(0).toUpperCase()
              : "";
            const displayType =
              primaryCode && secondaryCode
                ? `${primaryCode} + ${secondaryCode}`
                : a.holland_code || "Belum tersedia";

            return {
              assessment_id: a.assessment_id,
              completed_at: a.completed_at,
              dominant_type: displayType,
            };
          }),
        });
      } else {
        setAssessmentStats({
          totalTests: 0,
          lastTestDate: null,
          topRecommendation: null,
          latestTestDetails: null,
          allTests: [],
        });
      }
    } catch (error) {
      console.error("Error fetching assessment data:", error);
      setAssessmentStats({
        totalTests: 0,
        lastTestDate: null,
        topRecommendation: null,
        latestTestDetails: null,
        allTests: [],
      });
    } finally {
      setAssessmentLoading(false);
    }
  };

  fetchAssessmentData();
}, []);
```

**Step:**

1. Call `hollandHandler.getAssessmentHistory()` - ambil semua riwayat tes
2. Hitung total tes yang diselesaikan
3. Jika ada tes:
   - Ambil tes terbaru (index 0)
   - Format tanggal tes terakhir (DD/MM/YYYY format Indonesia)
   - Call `hollandHandler.getAssessmentResult(assessment_id)` untuk detail
   - Extract scores dan recommendations
   - Ambil top 5 recommendations
   - Format dominant_type untuk setiap tes (gabungan primary + secondary type)
4. Update `assessmentStats` state
5. Set `assessmentLoading = false`

## 3. Client Handlers

### 3.1 userHandler.getUserById()

```typescript
async getUserById(userId?: string): Promise<User> {
  try {
    const finalUserId = userId || TokenManager.getUserData().userId;

    const response = await axios.get(
      `${API_URL}/api/users/${finalUserId}`,
      this.getAuthHeader()
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        TokenManager.logout();
        window.location.href = "/login";
      }
      throw new Error(
        error.response?.data?.message || "Gagal mengambil data user"
      );
    }
    throw error;
  }
}
```

**Step:**

1. Get userId dari parameter atau TokenManager
2. GET request ke `/api/users/${userId}` dengan Bearer token
3. Return user data dari response
4. Handle 401/403 → logout dan redirect ke login

### 3.2 prodiHandler.getAllProdi()

```typescript
async getAllProdi(limit?: number): Promise<ProdiResponse> {
  try {
    const token = TokenManager.getToken();
    const url = limit
      ? `${API_URL}/api/prodi?limit=${limit}`
      : `${API_URL}/api/prodi`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      this.handleAuthError(error.response?.status || 500);
      throw new Error(
        error.response?.data?.message || "Gagal mengambil data prodi"
      );
    }
    throw error;
  }
}
```

**Step:**

1. Build URL dengan limit parameter jika ada
2. GET request ke `/api/prodi?limit=${limit}` dengan Bearer token
3. Return prodi data dengan pagination info
4. Handle auth error

### 3.3 universitasHandler.getAllUniversitas()

```typescript
async getAllUniversitas(limit?: number): Promise<UniversitasResponse> {
  try {
    const token = TokenManager.getToken();
    const url = limit
      ? `${API_URL}/api/universitas?limit=${limit}`
      : `${API_URL}/api/universitas`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      this.handleAuthError(error.response?.status || 500);
      throw new Error(
        error.response?.data?.message || "Gagal mengambil data universitas"
      );
    }
    throw error;
  }
}
```

**Step:**

1. Build URL dengan limit parameter jika ada
2. GET request ke `/api/universitas?limit=${limit}` dengan Bearer token
3. Return universitas data dengan pagination info
4. Handle auth error

### 3.4 hollandHandler.getAssessmentHistory()

```typescript
async getAssessmentHistory(): Promise<AssessmentHistory[]> {
  try {
    const token = TokenManager.getToken();
    const response = await axios.get(`${API_URL}/api/holland/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      this.handleAuthError(error.response.status);
    }
    throw error;
  }
}
```

**Step:**

1. GET request ke `/api/holland/history` dengan Bearer token
2. Return array assessment history
3. Handle auth error

### 3.5 hollandHandler.getAssessmentResult()

```typescript
async getAssessmentResult(assessmentId: string): Promise<AssessmentResult> {
  try {
    const token = TokenManager.getToken();
    const response = await axios.get(
      `${API_URL}/api/holland/result/${assessmentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      this.handleAuthError(error.response.status);
    }
    throw error;
  }
}
```

**Step:**

1. GET request ke `/api/holland/result/${assessmentId}` dengan Bearer token
2. Return detailed assessment result (scores + recommendations)
3. Handle auth error

## 4. Server Controllers

### 4.1 UserController.getUserById()

```typescript
async getUserById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = await this.userService.getUserById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
      message: "User retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
```

**Step:**

1. Extract `id` dari req.params
2. Call `userService.getUserById(id)`
3. Return 404 jika user tidak ditemukan
4. Return 200 dengan user data jika ditemukan

### 4.2 ProdiController.getAllProdi()

```typescript
async getAllProdi(req: Request, res: Response) {
  try {
    const {
      page = "1",
      limit,
      search = "",
      jenjang = "",
      akreditasi = "",
    } = req.query as any;

    const hasSearch = search && search.trim().length > 0;
    const hasFilter =
      (jenjang && jenjang !== "Semua") ||
      (akreditasi && akreditasi !== "Semua");

    // Logic:
    // 1. Search with keyword → limit 15
    // 2. Filter only (no search) → no limit (get all matching)
    // 3. No filter, no search → limit 15
    let take: number;
    if (hasSearch) {
      take = 15; // Search always limited to 15 best matches
    } else if (hasFilter) {
      take = 10000; // Filter without search gets all data
    } else {
      take = limit
        ? Math.min(Math.max(parseInt(limit as string, 10) || 15, 1), 1000)
        : 15;
    }

    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
    const skip = (pageNum - 1) * take;

    const { data, total } = await this.localService.getAllProdiLocal({
      search: search as string,
      jenjang: jenjang as string,
      akreditasi: akreditasi as string,
      skip,
      take,
    });

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error("Error in getAllProdi:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
```

**Step:**

1. Extract query parameters (page, limit, search, jenjang, akreditasi)
2. Determine take value based on search/filter:
   - Has search → limit 15
   - Has filter only → limit 10000 (get all)
   - No search/filter → use limit parameter or default 15
3. Calculate skip value untuk pagination
4. Call `localService.getAllProdiLocal()` dengan parameters
5. Return prodi data dengan pagination info

### 4.3 UniversitasController.getAllUniversitas()

```typescript
async getAllUniversitas(req: Request, res: Response) {
  try {
    const {
      page = "1",
      limit,
      search = "",
      akreditasi = "",
      provinsi = "",
    } = req.query as any;

    const hasSearch = search && search.trim().length > 0;
    const hasFilter =
      (akreditasi && akreditasi !== "Semua") ||
      (provinsi && provinsi !== "Semua");

    let take: number;
    if (hasSearch) {
      take = 15;
    } else if (hasFilter) {
      take = 10000;
    } else {
      take = limit
        ? Math.min(Math.max(parseInt(limit as string, 10) || 15, 1), 1000)
        : 15;
    }

    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
    const skip = (pageNum - 1) * take;

    const { data, total } = await this.localService.getAllUniversitasLocal({
      search: search as string,
      akreditasi: akreditasi as string,
      provinsi: provinsi as string,
      skip,
      take,
    });

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error("Error in getAllUniversitas:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
```

**Step:**

1. Extract query parameters (page, limit, search, akreditasi, provinsi)
2. Determine take value based on search/filter (sama seperti prodi)
3. Calculate skip value untuk pagination
4. Call `localService.getAllUniversitasLocal()` dengan parameters
5. Return universitas data dengan pagination info

### 4.4 HollandController.getAssessmentHistory()

```typescript
async getAssessmentHistory(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.user_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const assessments = await hollandService.getUserAssessments(userId);

    res.status(200).json({
      success: true,
      data: assessments,
      message: "Assessment history retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error fetching assessment history:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve assessment history",
    });
  }
}
```

**Step:**

1. Extract userId dari req.user (set by auth middleware)
2. Validasi userId tidak kosong
3. Call `hollandService.getUserAssessments(userId)`
4. Return assessment history

### 4.5 HollandController.getAssessmentResult()

```typescript
async getAssessmentResult(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.user_id;
    const { assessmentId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        message: "Assessment ID is required",
      });
    }

    const result = await hollandService.getAssessmentById(
      assessmentId,
      userId
    );

    res.status(200).json({
      success: true,
      data: result,
      message: "Assessment result retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error fetching assessment result:", error);
    if (error.message === "Assessment not found") {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve assessment result",
    });
  }
}
```

**Step:**

1. Extract userId dari req.user
2. Extract assessmentId dari req.params
3. Validasi userId dan assessmentId
4. Call `hollandService.getAssessmentById(assessmentId, userId)`
5. Return assessment result dengan scores dan recommendations
6. Handle 404 jika assessment tidak ditemukan

## 5. Server Services

### 5.1 UserService.getUserById()

```typescript
async getUserById(userId: string): Promise<UserResponse | null> {
  try {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return null;
    }

    return {
      user_id: user.user_id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      kelas: user.kelas,
    };
  } catch (error) {
    console.error("Error in getUserById:", error);
    throw new Error("Failed to fetch user");
  }
}
```

**Step:**

1. Call `userRepository.findById(userId)`
2. Return null jika user tidak ditemukan
3. Format dan return user data

### 5.2 ProdiService.getAllProdiLocal()

```typescript
async getAllProdiLocal({
  search = "",
  jenjang = "",
  akreditasi = "",
  skip = 0,
  take = 50,
}: {
  search?: string;
  jenjang?: string;
  akreditasi?: string;
  skip?: number;
  take?: number;
}) {
  try {
    // If search keyword exists, use search function (limit 15)
    if (search && search.trim().length > 0) {
      const searchResults = await this.searchProdiLocal(search.trim(), take);
      return {
        data: searchResults,
        total: searchResults.length,
      };
    }

    // Get total count first
    const totalCount = await this.prodiRepository.count();

    // Fetch prodi with proper limit and offset
    const allProdi = await this.prodiRepository.findMany({
      limit: take,
      offset: skip,
    });

    const detailedProdi = await Promise.all(
      allProdi.map(async (prodi) => {
        const detailed = await this.prodiRepository.findById(prodi.prodi_id);
        if (!detailed) return null;

        return {
          prodi_id: detailed.prodi_id.toString(),
          nama_prodi: detailed.nama_prodi,
          jenjang: detailed.jenjang,
          akreditasi: detailed.prodi_pt[0]?.universitas?.akreditasi || null,
          universitas: detailed.prodi_pt[0]?.universitas
            ? {
                university_id: detailed.prodi_pt[0].universitas.university_id,
                nama: detailed.prodi_pt[0].universitas.nama,
                akreditasi: detailed.prodi_pt[0].universitas.akreditasi,
                provinsi: detailed.prodi_pt[0].universitas.provinsi,
                kota: detailed.prodi_pt[0].universitas.kota,
              }
            : null,
        };
      })
    );

    let filteredResults = detailedProdi.filter(
      (p): p is NonNullable<typeof p> => p !== null
    );

    // Apply jenjang filter if specified
    if (jenjang && jenjang !== "Semua") {
      filteredResults = filteredResults.filter((p) => p.jenjang === jenjang);
    }

    // Apply akreditasi filter if specified
    if (akreditasi && akreditasi !== "Semua") {
      filteredResults = filteredResults.filter(
        (p) => p.akreditasi === akreditasi
      );
    }

    return {
      data: filteredResults,
      total: totalCount,
    };
  } catch (error) {
    console.error("Error getting all prodi locally:", error);
    throw error;
  }
}
```

**Step:**

1. Jika ada search keyword → call `searchProdiLocal()` untuk fuzzy search
2. Jika tidak ada search:
   - Count total prodi
   - Fetch prodi dengan limit dan offset
   - Untuk setiap prodi, fetch detail termasuk universitas
   - Format prodi data dengan universitas info
3. Apply filter jenjang jika ada
4. Apply filter akreditasi jika ada
5. Return filtered data dan total count

### 5.3 UniversitasService.getAllUniversitasLocal()

```typescript
async getAllUniversitasLocal({
  search = "",
  akreditasi = "",
  provinsi = "",
  skip = 0,
  take = 50,
}: {
  search?: string;
  akreditasi?: string;
  provinsi?: string;
  skip?: number;
  take?: number;
}) {
  try {
    // If search keyword exists, use search function (limit 15)
    if (search && search.trim().length > 0) {
      const searchResults = await this.searchUniversitasLocal(
        search.trim(),
        take
      );
      return {
        data: searchResults,
        total: searchResults.length,
      };
    }

    // Get all universitas without search
    const hasFilter =
      (akreditasi && akreditasi !== "Semua") ||
      (provinsi && provinsi !== "Semua");

    // When no filter, fetch more data to sort properly by QS rank
    const fetchLimit = hasFilter ? take : 10000; // Fetch all data when no filter for proper sorting

    const allUniversitas = await this.universitasRepository.findMany({
      limit: fetchLimit,
    });

    // Apply filters
    let filteredUniversitas = [...allUniversitas];

    if (akreditasi && akreditasi !== "Semua") {
      filteredUniversitas = filteredUniversitas.filter(
        (u) => u.akreditasi === akreditasi
      );
    }

    if (provinsi && provinsi !== "Semua") {
      filteredUniversitas = filteredUniversitas.filter(
        (u) => u.provinsi === provinsi
      );
    }

    // Sort by QS rank ascending when no filter (default behavior)
    if (!hasFilter) {
      // Default: sort by QS rank ascending (lower number = better rank)
      filteredUniversitas.sort((a, b) => {
        const rankA = a.rank_qs ? parseFloat(a.rank_qs) : Infinity;
        const rankB = b.rank_qs ? parseFloat(b.rank_qs) : Infinity;
        return rankA - rankB;
      });
      // Limit to requested amount after sorting
      filteredUniversitas = filteredUniversitas.slice(0, take);
    }

    const transformedResults = filteredUniversitas.map((univ) => ({
      university_id: univ.university_id.toString(),
      nama: univ.nama,
      nama_singkat: univ.nama_singkat,
      akreditasi: univ.akreditasi,
      rank_qs: univ.rank_qs ? parseFloat(univ.rank_qs) : null,
      rank_country: univ.rank_country ? parseFloat(univ.rank_country) : null,
      // ... other fields
    }));

    return {
      data: transformedResults,
      total: filteredUniversitas.length,
    };
  } catch (error) {
    console.error("Error getting all universitas locally:", error);
    throw error;
  }
}
```

**Step:**

1. Jika ada search keyword → call `searchUniversitasLocal()` untuk fuzzy search
2. Jika tidak ada search:
   - Determine fetch limit (10000 jika no filter untuk sorting proper)
   - Fetch universitas dari repository
   - Apply filter akreditasi jika ada
   - Apply filter provinsi jika ada
   - Sort by QS rank ascending jika no filter
   - Limit hasil setelah sorting
3. Transform data ke format response
4. Return data dan total count

### 5.4 HollandService.getUserAssessments()

```typescript
async getUserAssessments(userId: string) {
  const assessments = await this.hollandRepository.findUserAssessments(userId);

  return assessments.map((assessment) => ({
    assessment_id: assessment.assessment_id,
    user_id: assessment.user_id,
    completed_at: assessment.completed_at,
    primary_type: assessment.primary_type,
    secondary_type: assessment.secondary_type,
    tertiary_type: assessment.tertiary_type,
    holland_code: assessment.holland_code,
    created_at: assessment.created_at,
  }));
}
```

**Step:**

1. Call `hollandRepository.findUserAssessments(userId)`
2. Map assessment data ke format response
3. Return array assessment history

### 5.5 HollandService.getAssessmentById()

```typescript
async getAssessmentById(assessmentId: string, userId: string) {
  // Fetch assessment
  const assessment = await this.hollandRepository.findAssessmentById(
    assessmentId
  );

  if (!assessment || assessment.user_id !== userId) {
    throw new Error("Assessment not found");
  }

  // Fetch responses for this assessment
  const responses = await this.hollandRepository.findAssessmentResponses(
    assessmentId
  );

  // Convert DB scores to HollandScores format
  const scores: HollandScores = {
    realistic: assessment.realistic_score || 0,
    investigative: assessment.investigative_score || 0,
    artistic: assessment.artistic_score || 0,
    social: assessment.social_score || 0,
    enterprising: assessment.enterprising_score || 0,
    conventional: assessment.conventional_score || 0,
  };

  // Get recommendations for this assessment
  const recommendations = await this.getRecommendations(scores);

  return {
    assessment_id: assessment.assessment_id,
    user_id: assessment.user_id,
    completed_at: assessment.completed_at,
    scores,
    primary_type: assessment.primary_type,
    secondary_type: assessment.secondary_type,
    tertiary_type: assessment.tertiary_type,
    holland_code: assessment.holland_code,
    recommendations: recommendations.slice(0, 20), // Top 20 recommendations
  };
}
```

**Step:**

1. Call `hollandRepository.findAssessmentById(assessmentId)`
2. Validasi assessment exists dan belongs to user
3. Fetch responses untuk assessment ini
4. Convert DB scores ke HollandScores format
5. Call `getRecommendations(scores)` untuk calculate recommendations
6. Return assessment result dengan scores dan top 20 recommendations

### 5.6 HollandService.getRecommendations()

```typescript
private async getRecommendations(scores: HollandScores): Promise<RecommendationResult[]> {
  // Get all prodi with Holland mapping
  const allProdi = await this.hollandRepository.findAllProdiWithMapping();

  // Calculate match percentage for each prodi
  const recommendations = allProdi.map((prodi) => {
    const matchPercentage = this.calculateMatchPercentage(
      prodi.primary_type as HollandType,
      prodi.secondary_type as HollandType | null,
      scores
    );

    return {
      prodi_id: prodi.prodi_id,
      nama_prodi: prodi.nama_prodi,
      jenjang: prodi.jenjang,
      match_percentage: matchPercentage,
      rank: 0, // Will be set after sorting
      primary_type: prodi.primary_type as HollandType,
      secondary_type: prodi.secondary_type as HollandType | null,
    };
  });

  // Sort by match percentage descending
  recommendations.sort((a, b) => b.match_percentage - a.match_percentage);

  // Assign rank
  recommendations.forEach((rec, index) => {
    rec.rank = index + 1;
  });

  return recommendations;
}
```

**Step:**

1. Fetch semua prodi dengan Holland mapping
2. Calculate match percentage untuk setiap prodi using Fuzzy Logic
3. Sort recommendations by match percentage descending
4. Assign rank (1 = highest match)
5. Return sorted recommendations

### 5.7 HollandService.calculateMatchPercentage()

```typescript
private calculateMatchPercentage(
  prodiPrimary: HollandType,
  prodiSecondary: HollandType | null,
  scores: HollandScores
): number {
  // Convert HollandScores to UserHollandScores format
  const userScores = {
    R: scores.realistic,
    I: scores.investigative,
    A: scores.artistic,
    S: scores.social,
    E: scores.enterprising,
    C: scores.conventional,
  };

  // Use Fuzzy Logic to calculate match percentage
  return fuzzyLogicService.calculateMatchPercentage(
    userScores,
    prodiPrimary,
    prodiSecondary
  );
}
```

**Step:**

1. Convert HollandScores format ke UserHollandScores format (single letter keys)
2. Call `fuzzyLogicService.calculateMatchPercentage()` dengan user scores dan prodi types
3. Return match percentage (0-100)

## 6. UI Display Logic

### 6.1 Hero Section

**Display:**

- Avatar dengan initial (firstname + lastname, atau 2 huruf pertama firstname)
- Greeting: "Hello, {firstname}!"
- Kelas: "Kelas {kelas}"
- Description text
- Button "Ubah profil" → navigate ke `/profil`

### 6.2 Info Section (Mobile Only)

**Display:**

- Grid 2x3 atau 3x3 icons
- Each icon navigates to different page:
  - Tentang Kami → `/about-us`
  - Telusuri Jurusan → `/jurusan`
  - Rekomendasi Universitas → `/universitas`
  - Apa itu Tes Minat Bakat → `/tes`
  - Informasi Beasiswa → `/beasiswa`
  - Hubungi Kami → `/contact-us`

### 6.3 Analytics Section

**Display jika ada data:**

- **Total Tes:** Show `totalTests` dengan format "X Tes"
- **Tes Terakhir:** Show `lastTestDate` dengan format DD/MM/YYYY
- **Holland Scores:**
  - Progress bar untuk setiap type (R, I, A, S, E, C)
  - Show percentage value
  - Color gradient from primary to secondary
- **Top 5 Rekomendasi Jurusan:**
  - List dengan nomor (1-5)
  - Nama prodi
  - Jenjang
  - Match percentage

**Display jika belum ada data:**

- Show "Belum ada data tes"
- Subtitle "Mulai tes pertama Anda untuk melihat statistik di sini"

### 6.4 Riwayat Tes Section (Horizontal Scroll)

**Display jika ada tes:**

- Scrollable horizontal cards
- Scroll buttons (left/right) jika ada > 3 tes
- Each card shows:
  - Tes number (#1, #2, dst - descending)
  - Dominant type badge (e.g., "R + I")
  - Completed date (DD Month YYYY)
  - Completed time (HH:MM)
- Click card → navigate to `/tes/hasil/${assessment_id}`

**Hidden jika belum ada tes**

### 6.5 Jurusan Section

**Display:**

- Search input untuk filter jurusan
- Display max 8 jurusan (sesuai search query)
- Each jurusan → clickable tag → navigate to `/jurusan` dengan state `{ selectedMajor: name }`
- Button "Lihat semua jurusan..." jika ada lebih dari 8
- Loading state: "Memuat data jurusan..."
- Empty state: "Belum ada data jurusan" atau "Tidak ada jurusan yang ditemukan"

### 6.6 Ujian Section

**Display:**

- Button dengan Plus icon
- Text "Lakukan tes baru..."
- Click → navigate to `/tes`

### 6.7 Universitas Section

**Display:**

- Search input untuk filter universitas
- Display max 8 universitas (sesuai search query)
- Each universitas → clickable tag → navigate to `/universitas` dengan state `{ selectedUniversity: name }`
- Button "Lihat semua universitas..." jika ada lebih dari 8
- Loading state: "Memuat data universitas..."
- Empty state: "Belum ada data universitas" atau "Tidak ada universitas yang ditemukan"

### 6.8 Konseling Section

**Display:**

- Button dengan Plus icon
- Text "Jadwalkan sesi konseling..."
- Click → navigate to `/konseling`

## 7. Search & Filter Logic

### Jurusan Search

```typescript
const filteredExploreMajors = allMajors.filter((m) =>
  m.toLowerCase().includes(searchQuery.toLowerCase())
);
const displayedExploreMajors = filteredExploreMajors.slice(0, 8);
const hasMoreExplore = filteredExploreMajors.length > 8;
```

**Step:**

1. Filter `allMajors` berdasarkan `searchQuery` (case insensitive)
2. Ambil max 8 hasil pertama
3. Check jika ada lebih dari 8 hasil → show "Lihat semua"

### Universitas Search

```typescript
const filteredUniversities = allUniversities.filter((u) =>
  u.toLowerCase().includes(universitySearchQuery.toLowerCase())
);
const displayedUniversities = filteredUniversities.slice(0, 8);
const hasMoreUniversities = filteredUniversities.length > 8;
```

**Step:**

1. Filter `allUniversities` berdasarkan `universitySearchQuery` (case insensitive)
2. Ambil max 8 hasil pertama
3. Check jika ada lebih dari 8 hasil → show "Lihat semua"

## Flow Summary

### Complete Home Page Load Flow

```
User open home page
→ 4 parallel data fetches:
  1. Fetch user data (userHandler.getUserById)
     → GET /api/users/{userId}
     → userService.getUserById()
     → userRepository.findById()
     → Return user data
     → Display in Hero Section

  2. Fetch prodi data (prodiHandler.getAllProdi with limit 679)
     → GET /api/prodi?limit=679
     → prodiService.getAllProdiLocal()
     → prodiRepository.findMany()
     → Return prodi list
     → Extract nama_prodi
     → Display in Jurusan section

  3. Fetch universitas data (universitasHandler.getAllUniversitas with limit 645)
     → GET /api/universitas?limit=645
     → universitasService.getAllUniversitasLocal()
     → universitasRepository.findMany()
     → Sort by QS rank
     → Return universitas list
     → Extract nama
     → Display in Universitas section

  4. Fetch assessment data:
     a) hollandHandler.getAssessmentHistory()
        → GET /api/holland/history
        → hollandService.getUserAssessments()
        → hollandRepository.findUserAssessments()
        → Return all assessments
        → Calculate totalTests
        → Format lastTestDate

     b) If has assessments:
        hollandHandler.getAssessmentResult(latestAssessmentId)
        → GET /api/holland/result/{assessmentId}
        → hollandService.getAssessmentById()
        → Fetch assessment from DB
        → Convert scores
        → Calculate recommendations (Fuzzy Logic)
        → Sort by match percentage
        → Return top 20 recommendations
        → Display scores + top 5 recommendations in Analytics
        → Display all tests in Riwayat Tes

→ Render complete home page with all data
```

## HTTP Requests/Responses

### Get User by ID

**Request:**

```http
GET /api/users/{userId}
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user_id": "US001",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "kelas": 11
  },
  "message": "User retrieved successfully"
}
```

### Get All Prodi

**Request:**

```http
GET /api/prodi?limit=679
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "prodi_id": "1",
      "nama_prodi": "Teknik Informatika",
      "jenjang": "S1",
      "akreditasi": "A",
      "universitas": {
        "university_id": "1",
        "nama": "Universitas Indonesia",
        "provinsi": "DKI Jakarta"
      }
    }
    // ... more prodi
  ],
  "pagination": {
    "total": 679,
    "page": 1,
    "limit": 679,
    "totalPages": 1
  }
}
```

### Get All Universitas

**Request:**

```http
GET /api/universitas?limit=645
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "university_id": "1",
      "nama": "Universitas Indonesia",
      "akreditasi": "A",
      "provinsi": "DKI Jakarta",
      "rank_qs": 248.5,
      "rank_country": 1
    }
    // ... more universitas
  ],
  "pagination": {
    "total": 645,
    "page": 1,
    "limit": 645,
    "totalPages": 1
  }
}
```

### Get Assessment History

**Request:**

```http
GET /api/holland/history
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "assessment_id": "ASM001",
      "user_id": "US001",
      "completed_at": "2024-11-27T10:30:00Z",
      "primary_type": "REALISTIC",
      "secondary_type": "INVESTIGATIVE",
      "tertiary_type": "CONVENTIONAL",
      "holland_code": "RIC",
      "created_at": "2024-11-27T10:00:00Z"
    }
    // ... more assessments
  ],
  "message": "Assessment history retrieved successfully"
}
```

### Get Assessment Result

**Request:**

```http
GET /api/holland/result/{assessmentId}
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "assessment_id": "ASM001",
    "user_id": "US001",
    "completed_at": "2024-11-27T10:30:00Z",
    "scores": {
      "realistic": 85,
      "investigative": 78,
      "artistic": 45,
      "social": 62,
      "enterprising": 55,
      "conventional": 72
    },
    "primary_type": "REALISTIC",
    "secondary_type": "INVESTIGATIVE",
    "tertiary_type": "CONVENTIONAL",
    "holland_code": "RIC",
    "recommendations": [
      {
        "prodi_id": 1,
        "nama_prodi": "Teknik Mesin",
        "jenjang": "S1",
        "match_percentage": 92.5,
        "rank": 1,
        "primary_type": "REALISTIC",
        "secondary_type": "INVESTIGATIVE"
      }
      // ... top 20 recommendations
    ]
  },
  "message": "Assessment result retrieved successfully"
}
```

## Error Handling

### Auth Error (401/403)

- Token expired atau invalid
- Handler: `TokenManager.logout()` + redirect to `/login`

### User Not Found (404)

- User ID tidak ditemukan
- Display: Error message di console

### Server Error (500)

- Database error atau internal error
- Display: Error message di console
- Show empty state di UI

### No Data States

- **No User Data:** Show "..." di Hero Section
- **No Prodi Data:** Show "Belum ada data jurusan"
- **No Universitas Data:** Show "Belum ada data universitas"
- **No Assessment Data:** Show "Belum ada data tes" + subtitle "Mulai tes pertama Anda"

### Loading States

- **Loading User:** Avatar shows "..."
- **Loading Prodi:** Show "Memuat data jurusan..."
- **Loading Universitas:** Show "Memuat data universitas..."
- **Loading Assessment:** Show loading spinner + "Memuat data analytics..."
