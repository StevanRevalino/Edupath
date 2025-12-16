# Jurusan Search Code Flow Documentation

## Overview

Dokumentasi ini menjelaskan alur lengkap untuk fitur **Menelusuri Jurusan Perkuliahan** di aplikasi Edupath, mencakup pencarian prodi, filter, sort, dan menampilkan detail prodi.

---

## 1. Flow Summary

### Main Steps:

1. User membuka halaman Jurusan
2. User melakukan pencarian prodi (opsional)
3. User menggunakan filter (Jenjang, Akreditasi) - opsional
4. Sistem menampilkan hasil pencarian/filter dalam tabel
5. User klik row untuk melihat detail prodi
6. Sistem menampilkan informasi lengkap prodi dan universitas
7. User dapat menyimpan riwayat pencarian

### Special Features:

- **Smart Search Algorithm**: Pencarian dengan scoring relevance (prodi + universitas)
- **Search Cache**: Cache hasil pencarian untuk performa optimal
- **Filter Persistence**: Filter state disimpan di localStorage
- **Search History**: Riwayat pencarian 10 terakhir
- **Auto-select Exact Match**: Auto-select prodi jika nama exact match
- **Pagination**: 10 items per page
- **Real-time Filter**: Filter data tanpa reload

---

## 2. Sequence Diagram

````mermaid
sequenceDiagram
    actor User
    participant HomePage as <<view>><br/>HomePage
    participant JurusanPage as <<view>><br/>JurusanPage
    participant prodiController
    participant ProdiDB as <<prisma>><br/>Prodi

    User->>HomePage: Access EDUPATH main page
    HomePage-->>User: Display home page

    User->>HomePage: Click 'Jurusan' button on Navigation bar
    HomePage->>JurusanPage: Navigate to /jurusan
    JurusanPage-->>User: Display jurusan page

    User->>JurusanPage: Enter jurusan name in search filter
    JurusanPage->>JurusanPage: handleInputChange()
    JurusanPage->>prodiController: searchProdiByName(keyword)

    prodiController->>prodiController: Process search criteria
    prodiController->>ProdiDB: findMany() with search algorithm
    ProdiDB-->>prodiController: List of prodi

    alt Prodi found
        prodiController-->>JurusanPage: Return matching prodi results
        JurusanPage-->>User: Display matching prodi results

        User->>JurusanPage: Click one of the prodi results
        JurusanPage->>prodiController: getProdiById(prodi_id)
        prodiController->>ProdiDB: findUnique(prodi_id)
        ProdiDB-->>prodiController: Prodi detail + university
        prodiController-->>JurusanPage: Return detail data
        JurusanPage-->>User: Display detailed information about prodi and university recommendations
    else Prodi not found
        prodiController-->>JurusanPage: Return empty result
        JurusanPage-->>User: Display placeholder message 'No prodi found'
    end
```---

## 3. Component Structure

### JurusanPage (`index.tsx`)

**State Management:**

```typescript
// Search states
const [heroQuery, setHeroQuery] = useState("");
const [query, setQuery] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [results, setResults] = useState<ProdiItem[]>([]);
const [hasSearched, setHasSearched] = useState(false);

// Detail states
const [selectedProdi, setSelectedProdi] = useState<ProdiDetail | null>(null);
const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
const [detailLoading, setDetailLoading] = useState(false);

// Filter states
const [selectedJenjang, setSelectedJenjang] = useState<string>("Semua");
const [selectedAkreditasi, setSelectedAkreditasi] = useState<string>("Semua");
const [sortBy, setSortBy] = useState<string>("");
const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

// Pagination
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;

// Search history
const [recentSearches, setRecentSearches] = useState<string[]>([]);
````

**Key Methods:**

- `search(q, autoSelectExactMatch)`: Pencarian prodi dengan cache dan scoring
- `fetchProdiDetail(prodiId, rowIndex)`: Fetch detail prodi untuk ditampilkan
- `fetchProdiWithFilters(searchKeyword)`: Unified fetch dengan filter support
- `pushHistory(term)`: Simpan keyword ke search history
- `removeHistoryItem(term)`: Hapus item dari history
- `clearHistory()`: Hapus semua history

**Cache Management:**

```typescript
const searchCacheRef = useRef<Map<string, ProdiItem[]>>(new Map());
```

### Child Components

**1. SearchBar (`components/SearchBar.tsx`)**

- Hero search input dengan suggestions
- Main search bar dengan autocomplete
- Submit handler untuk trigger search

**2. FilterSortBar (`components/FilterSortBar.tsx`)**

- Filter dropdown: Jenjang, Akreditasi
- Reset filter button
- Filter state persistence dengan localStorage
- Active filter count badge

**3. SearchHistory (`components/SearchHistory.tsx`)**

- Menampilkan 10 riwayat pencarian terakhir
- Click to search again
- Remove individual item
- Clear all history

---

## 4. Search Algorithm

### Scoring System (Backend - `prodiController.ts`)

```typescript
Prioritas Scoring:
1. Kombinasi Prodi + Universitas (Score: +100)
   - Contoh: "ti binus", "informatika ui"
   - Extra: +15 per matching word

2. Exact Match Prodi (Score: +50)
   - Full match nama prodi

3. Acronym Match (Score: +30-40)
   - Prodi acronym: +40
   - Universitas acronym: +30

4. Word Match (Score: +10-20)
   - Start of word: +20
   - Contains word: +10

5. Sequential Match (Score: +25)
   - Words muncul berurutan

6. Partial Match (Score: +5)
   - Substring match
```

### Filter Logic

```typescript
1. Pencarian + Filter:
   - Backend: Search dengan scoring (limit 15)
   - Frontend: Filter hasil search (jenjang, akreditasi)

2. Filter Only (tanpa keyword):
   - Backend: findMany() dengan WHERE clause
   - Return: Semua data matching filter

3. No Filter, No Search:
   - Backend: findMany() limit 15
   - Return: Top 15 ascending
```

---

## 5. API Specification

### 1. Search Prodi by Name

**Endpoint:** `GET /api/prodi/search/nama/:nama`

**Request:**

```http
GET /api/prodi/search/nama/informatika%20ui
Authorization: Bearer {token}
```

**Response Success:**

```json
{
  "success": true,
  "data": [
    {
      "prodi_id": "uuid",
      "nama_prodi": "Teknik Informatika",
      "jenjang": "S1",
      "bidang": "Teknologi Informasi",
      "akreditasi": "Unggul",
      "universitas": {
        "university_id": "uuid",
        "nama": "Universitas Indonesia",
        "provinsi": "DKI Jakarta"
      }
    }
  ],
  "message": "Success"
}
```

### 2. Get All Prodi (with filters)

**Endpoint:** `GET /api/prodi`

**Request:**

```http
GET /api/prodi?jenjang=S1&akreditasi=Unggul&limit=15
Authorization: Bearer {token}
```

**Response:** Same structure as search

### 3. Get Prodi Detail

**Endpoint:** `GET /api/prodi/detail/:id`

**Request:**

```http
GET /api/prodi/detail/uuid-prodi-id
Authorization: Bearer {token}
```

**Response Success:**

```json
{
  "success": true,
  "data": {
    "prodi_id": "uuid",
    "nama_prodi": "Teknik Informatika",
    "jenjang": "S1",
    "status": "Aktif",
    "kode_prodi": "12345",
    "bidang": "Teknologi Informasi",
    "akreditasi": "Unggul",
    "akreditasi_internasional": "ABET",
    "status_akreditasi": "Aktif",
    "tanggal_berdiri": "2000-01-01",
    "no_tel": "021-12345678",
    "no_fax": "021-12345679",
    "website": "https://cs.ui.ac.id",
    "email": "cs@ui.ac.id",
    "alamat": "Jl. Margonda Raya, Depok",
    "universitas": {
      "university_id": "uuid",
      "nama": "Universitas Indonesia",
      "kode_pt": "001",
      "provinsi": "DKI Jakarta",
      "kab_kota": "Depok",
      "kecamatan": "Beji",
      "lintang": -6.123456,
      "bujur": 106.123456
    }
  },
  "message": "Success"
}
```

---

## 6. Data Flow & Cache Management

### Search Cache Strategy

```typescript
1. Cache Key:
   - Lowercase trimmed query
   - Contoh: "informatika ui" → "informatika ui"

2. Cache Storage:
   - searchCacheRef.current (Map)
   - Max entries: Unlimited (cleared on page reload)

3. Cache Hit:
   - Return immediately
   - No API call
   - Fast response

4. Cache Miss:
   - Fetch dari backend
   - Save to cache
   - Return hasil
```

### LocalStorage Usage

```typescript
1. Filter State:
   - Key: "jurusanFilterOpen"
   - Value: boolean (showFilters)

2. Search History:
   - Key: "edupath:prodiSearchHistory"
   - Value: string[] (max 10 items)
   - FIFO: Newest first, remove oldest if > 10
```

---

## 7. Filter & Sort Features

### Filter Options

**Jenjang:**

- Semua (default)
- D3, D4, S1, S2, S3
- Dynamic: Extracted from data

**Akreditasi:**

- Semua (default)
- Unggul
- Baik Sekali
- Baik
- Fixed options

### Filter Persistence

```typescript
useEffect(() => {
  localStorage.setItem("jurusanFilterOpen", JSON.stringify(showFilters));
}, [showFilters]);

// On mount
const [showFilters, setShowFilters] = useState(() => {
  const saved = localStorage.getItem("jurusanFilterOpen");
  return saved ? JSON.parse(saved) : false;
});
```

### Active Filter Count

```typescript
const activeFilterCount = [
  selectedJenjang !== "Semua",
  selectedAkreditasi !== "Semua",
].filter(Boolean).length;

// Badge display: {activeFilterCount}
```

---

## 8. Pagination

### Implementation

```typescript
const itemsPerPage = 10;
const [currentPage, setCurrentPage] = useState(1);

// Filtered & Sorted results
const filteredResults = useMemo(() => {
  let filtered = [...results];

  // Apply filters
  if (selectedJenjang !== "Semua") {
    filtered = filtered.filter((p) => p.jenjang === selectedJenjang);
  }
  if (selectedAkreditasi !== "Semua") {
    filtered = filtered.filter((p) => p.akreditasi === selectedAkreditasi);
  }

  // Apply sorting
  if (sortBy) {
    filtered.sort((a, b) => {
      // Sort logic
    });
  }

  return filtered;
}, [results, selectedJenjang, selectedAkreditasi, sortBy, sortOrder]);

// Paginated results
const paginatedResults = useMemo(() => {
  const start = (currentPage - 1) * itemsPerPage;
  return filteredResults.slice(start, start + itemsPerPage);
}, [filteredResults, currentPage]);
```

---

## 9. User Experience Flow

### Happy Path - Search:

```
1. User masuk halaman Jurusan ✅
2. Ketik "informatika ui" di search bar ✅
3. Klik "Cari" atau Enter ✅
4. Loading state muncul ✅
5. Cache check (miss) ✅
6. API call ke /api/prodi/search/nama/informatika%20ui ✅
7. Backend scoring algorithm (Prodi + Univ match) ✅
8. Return top 15 hasil ✅
9. Save to cache ✅
10. Save to search history ✅
11. Tampilkan hasil di tabel ✅
12. Auto-select exact match (jika ada) ✅
13. Detail panel muncul ✅
```

### Happy Path - Filter:

```
1. User klik "Filter" button ✅
2. Filter panel expand ✅
3. Pilih Jenjang "S1" ✅
4. Pilih Akreditasi "Unggul" ✅
5. Save filter ke localStorage ✅
6. Active filter count badge: 2 ✅
7. API call dengan query params ✅
8. Return filtered data ✅
9. Tampilkan hasil ✅
10. User klik row → Detail muncul ✅
```

### Happy Path - History:

```
1. User sudah search "informatika", "sistem informasi" ✅
2. Search history muncul di sidebar ✅
3. User klik "informatika" ✅
4. Auto-fill search bar ✅
5. Cache hit (data dari cache) ✅
6. Instant result ✅
7. Auto-select exact match ✅
```

### Error Path - No Results:

```
1. User search "zzzzzzzzz" ❌
2. API call success ✅
3. Empty array returned ✅
4. Tampilkan "Tidak ada hasil" message ✅
5. Suggestion: "Coba kata kunci lain" ✅
```

### Error Path - Network Error:

```
1. User search "informatika" ✅
2. Network timeout/error ❌
3. Catch error ❌
4. setError("Terjadi kesalahan") ❌
5. Tampilkan error toast ❌
6. Hasil kosong ❌
```

---

## 10. Component Lifecycle

### On Mount

```typescript
useEffect(() => {
  // 1. Load search history dari localStorage
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) setRecentSearches(JSON.parse(raw));
  } catch {}

  // 2. Load filter state dari localStorage (sudah di useState initializer)

  // 3. Check URL params untuk auto-search
  const params = new URLSearchParams(location.search);
  const q = params.get("q");
  if (q) {
    setQuery(q);
    search(q, true);
  }
}, []);
```

### On Filter Change

```typescript
useEffect(() => {
  if (hasSearched) {
    fetchProdiWithFilters(query);
  }
}, [selectedJenjang, selectedAkreditasi]);
```

### On Search

```typescript
1. Check canSearch (min 2 chars)
2. Check cache
3. If cache hit → use cache
4. If cache miss → API call
5. Save to cache
6. Save to history
7. Display results
8. Auto-select exact match (if enabled)
```

---

## 11. Badge & Status Display

### Akreditasi Badge

```typescript
const badgeClass = (value?: string | null) => {
  const v = (value || "").toLowerCase();
  if (v === "unggul" || v === "a") return "bg-green-100 text-green-800";
  if (v === "baik sekali" || v === "b")
    return "bg-secondary-light text-primary-dark";
  if (v === "baik" || v === "c") return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-800";
};
```

### Jenjang Badge

```typescript
// Colors by jenjang
D3: bg-purple-100 text-purple-800
D4: bg-indigo-100 text-indigo-800
S1: bg-blue-100 text-blue-800
S2: bg-green-100 text-green-800
S3: bg-orange-100 text-orange-800
```

---

## 12. Special Features Detail

### 1. Smart Search Algorithm

**Backend Scoring:**

```typescript
- Kombinasi match: "ti binus" → Boost +100
- Exact match: "teknik informatika" → +50
- Acronym match: "ti" → "Teknik Informatika" → +40
- Word start: "tek" → "Teknik" → +20
- Word contains: "nik" → "Teknik" → +10
- Sequential: "teknik sipil" → +25
```

**Frontend Auto-select:**

```typescript
if (autoSelectExactMatch && filtered.length > 0) {
  const exact = filtered.find(
    (p) => p.nama_prodi.toLowerCase() === q.trim().toLowerCase()
  );
  if (exact) {
    fetchProdiDetail(exact.prodi_id, exactIndex);
  }
}
```

### 2. Abort Previous Requests

```typescript
const controllerRef = useRef<AbortController | null>(null);

// On new search
if (controllerRef.current) controllerRef.current.abort();
const ctrl = new AbortController();
controllerRef.current = ctrl;

// Prevent race conditions
const currentId = ++searchRequestIdRef.current;
if (currentId !== searchRequestIdRef.current) return;
```

### 3. Request ID System

```typescript
const searchRequestIdRef = useRef(0);
const detailRequestIdRef = useRef(0);

// On each request
const currentId = ++searchRequestIdRef.current;

// On response
if (currentId !== searchRequestIdRef.current) return; // Discard stale response
```

---

## 13. Performance Optimizations

### 1. Memoization

```typescript
const canSearch = useMemo(() => query.trim().length >= 2, [query]);

const filteredResults = useMemo(() => {
  // Filter & sort logic
}, [results, selectedJenjang, selectedAkreditasi, sortBy, sortOrder]);

const paginatedResults = useMemo(() => {
  // Pagination logic
}, [filteredResults, currentPage]);
```

### 2. Debounce (if needed)

```typescript
// Optional: Add debounce to search input
const debouncedQuery = useDebounce(query, 300);

useEffect(() => {
  if (debouncedQuery && canSearch) {
    search(debouncedQuery);
  }
}, [debouncedQuery]);
```

### 3. Virtual Scrolling (future enhancement)

```typescript
// For large datasets (> 1000 items)
// Consider react-window or react-virtualized
```

---

## 14. Error Handling

### API Errors

```typescript
try {
  const response = await axios.get(url, config);
  // Success
} catch (e: any) {
  if (e.code === "ERR_CANCELED") return; // Aborted request

  const msg = e?.response?.data?.message || e?.message || "Terjadi kesalahan";
  setError(msg);
  setResults([]);

  // Optional: Show toast
  toast.error(msg);
}
```

### Token Expiry

```typescript
// Handled by axios interceptor (global)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      TokenManager.logout();
      navigate("/login");
      toast.error("Token expired. Silakan login kembali.");
    }
    return Promise.reject(error);
  }
);
```

---

## 15. Integration Points

### Frontend → Backend:

- `GET /api/prodi/search/nama/:nama`: Search prodi by keyword
- `GET /api/prodi`: Get all prodi with filters
- `GET /api/prodi/detail/:id`: Get prodi detail

### LocalStorage:

- `jurusanFilterOpen`: Filter panel state (boolean)
- `edupath:prodiSearchHistory`: Search history (string[])

### Navigation:

- Query params: `?q=keyword` untuk auto-search on mount
- Deep linking support

---

## 16. Dependencies

### Frontend Libraries:

- `react-router-dom`: Navigation & location
- `axios`: HTTP requests
- `lucide-react`: Icons
- `react-hot-toast`: Toast notifications (optional)

### Backend:

- `prisma`: ORM untuk database
- `express`: HTTP server

---

## 17. Database Schema

### Prodi Table

```prisma
model Prodi {
  prodi_id                  String   @id @default(uuid())
  nama_prodi                String
  jenjang                   String?
  status                    String?
  kode_prodi                String?
  bidang                    String?
  akreditasi                String?
  akreditasi_internasional  String?
  status_akreditasi         String?
  tanggal_berdiri           DateTime?
  no_tel                    String?
  no_fax                    String?
  website                   String?
  email                     String?
  alamat                    String?
  university_id             String?
  universitas               Universitas? @relation(fields: [university_id], references: [university_id])
}
```

---

## Conclusion

Flow ini mengimplementasikan **pencarian jurusan perkuliahan** dengan:

- ✅ Smart search algorithm dengan scoring relevance
- ✅ Cache management untuk performa optimal
- ✅ Filter & sort dinamis
- ✅ Search history dengan localStorage
- ✅ Pagination untuk navigasi data
- ✅ Detail panel dengan informasi lengkap
- ✅ Error handling yang robust
- ✅ Request cancellation untuk prevent race conditions

Sistem dirancang untuk memberikan user experience yang cepat dan intuitif dalam menemukan jurusan yang sesuai.
