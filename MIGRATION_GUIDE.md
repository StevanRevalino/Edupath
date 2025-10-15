# Frontend Migration Guide: notes → description & admin_notes

## ⚠️ PENTING: Baca ini sebelum mulai!

Karena ada 2 jenis `notes`:

1. **notes dari murid** (description) - catatan saat bikin konsultasi
2. **notes dari admin** (admin_notes) - alasan reschedule/decline

Kita perlu hati-hati dalam replace! Tidak bisa langsung find & replace all.

---

## File 1: ModalJadwalkanKonseling.tsx

**Lokasi**: `client/src/pages/user/Konseling/components/ModalJadwalkanKonseling.tsx`

### Langkah-langkah:

1. **Find & Replace di state initialization (line ~71)**:

   ```typescript
   // BEFORE:
   notes: "",

   // AFTER:
   description: "",
   ```

2. **Find & Replace di API calls (line ~263, ~293)**:

   ```typescript
   // BEFORE:
   notes: formData.notes,

   // AFTER:
   description: formData.description,
   ```

3. **Find & Replace di reset functions (line ~309, ~355)**:

   ```typescript
   // BEFORE:
   notes: "",

   // AFTER:
   description: "",
   ```

4. **Find & Replace di textarea element (line ~585-602)**:

   ```typescript
   // BEFORE:
   name="notes"
   value={formData.notes}
   if (errors.notes) {
     setErrors((prev) => ({ ...prev, notes: "" }));
   }
   errors.notes && "border-red-500"
   {errors.notes && (
     <p className="text-red-500 text-xs mt-1">{errors.notes}</p>
   )}

   // AFTER:
   name="description"
   value={formData.description}
   if (errors.description) {
     setErrors((prev) => ({ ...prev, description: "" }));
   }
   errors.description && "border-red-500"
   {errors.description && (
     <p className="text-red-500 text-xs mt-1">{errors.description}</p>
   )}
   ```

**ATAU gunakan VS Code Find & Replace**:

- Find: `notes` (case sensitive)
- Replace: `description`
- Scope: **HANYA file ModalJadwalkanKonseling.tsx**

---

## File 2: KelolaDataKonseling.tsx (ADMIN - PALING KOMPLEKS!)

**Lokasi**: `client/src/pages/admin/components/KelolaDataKonseling.tsx`

### ⚠️ PERHATIAN: Ada 2 tipe notes di file ini!

#### A. admin_notes (reschedule/decline)

Semua yang menggunakan pattern:

- `consultation.notes.includes("[DIJADWALKAN ULANG]")`
- `consultation.notes.includes("[DIBATALKAN OLEH MURID]")`
- `consultation.notes.replace("[DIJADWALKAN ULANG] ", "")`

**Ganti**: `consultation.notes` → `consultation.admin_notes`

#### B. description (regular notes dari murid)

Yang **TIDAK** menggunakan pattern `[DIJADWALKAN ULANG]` atau `[DIBATALKAN OLEH MURID]`

**Ganti**: `consultation.notes` → `consultation.description`

### Cara paling aman:

**Step 1**: Update API calls (line ~242, ~257)

```typescript
// BEFORE:
{ status: newStatus, notes: result.value }
notes: result.value,

// AFTER:
{ status: newStatus, admin_notes: result.value }
admin_notes: result.value,
```

**Step 2**: Update desktop table - Topic column (line ~698-742)

```typescript
// BEFORE:
{consultation.notes && (
  // ... conditional rendering ...
  {consultation.notes.includes("[DIBATALKAN OLEH MURID]")
  {consultation.notes.replace("[DIBATALKAN OLEH MURID] ", "")}
  {consultation.notes.includes("[DIJADWALKAN ULANG]")
  {consultation.notes.replace("[DIJADWALKAN ULANG] ", "")}
  title={consultation.notes}
  {consultation.notes}
)}

// AFTER:
{consultation.admin_notes && (
  // untuk reschedule/decline yang ada prefix
  {consultation.admin_notes.includes("[DIBATALKAN OLEH MURID]")
  {consultation.admin_notes.replace("[DIBATALKAN OLEH MURID] ", "")}
  {consultation.admin_notes.includes("[DIJADWALKAN ULANG]")
  {consultation.admin_notes.replace("[DIJADWALKAN ULANG] ", "")}
  // Tapi untuk regular notes tanpa prefix:
  title={consultation.description}
  {consultation.description}
)}

// ATAU buat conditional baru:
{consultation.admin_notes && (
  // tampilkan admin_notes (reschedule/decline)
)}
{consultation.description && !consultation.admin_notes && (
  // tampilkan description (notes murid)
)}
```

**Step 3**: Update desktop table - Status column (line ~780, ~787)

```typescript
// BEFORE:
{consultation.notes?.includes("[DIJADWALKAN ULANG]")
{consultation.notes?.includes("[DIBATALKAN OLEH MURID]")

// AFTER:
{consultation.admin_notes?.includes("[DIJADWALKAN ULANG]")
{consultation.admin_notes?.includes("[DIBATALKAN OLEH MURID]")
```

**Step 4**: Update mobile view - sama seperti desktop

**Step 5**: Update detail modal (line ~1339+)

```typescript
// BEFORE:
{selectedConsultation.notes && (
  selectedConsultation.notes.includes("[DIBATALKAN OLEH MURID]")
  selectedConsultation.notes.includes("[DIJADWALKAN ULANG]")
  {selectedConsultation.notes.replace(...)
  {selectedConsultation.notes

// AFTER:
{selectedConsultation.admin_notes && (
  selectedConsultation.admin_notes.includes("[DIBATALKAN OLEH MURID]")
  selectedConsultation.admin_notes.includes("[DIJADWALKAN ULANG]")
  {selectedConsultation.admin_notes.replace(...)
)}
{selectedConsultation.description && (
  <div>Description: {selectedConsultation.description}</div>
)}
```

---

## File 3: ConsultationInfo.tsx (USER)

**Lokasi**: `client/src/pages/user/Konseling/components/ConsultationInfo.tsx`

### Pattern yang jelas:

**admin_notes** (line ~280-326):

```typescript
// BEFORE:
{consultation.status === "DECLINED" && consultation.notes && (
  {consultation.notes.includes("[DIBATALKAN OLEH MURID]")
  {consultation.notes.replace("[DIBATALKAN OLEH MURID] ", "")}
)}
{consultation.notes?.includes("[DIJADWALKAN ULANG]") && (
  {consultation.notes.replace("[DIJADWALKAN ULANG] ", "")}
)}

// AFTER:
{consultation.status === "DECLINED" && consultation.admin_notes && (
  {consultation.admin_notes.includes("[DIBATALKAN OLEH MURID]")
  {consultation.admin_notes.replace("[DIBATALKAN OLEH MURID] ", "")}
)}
{consultation.admin_notes?.includes("[DIJADWALKAN ULANG]") && (
  {consultation.admin_notes.replace("[DIJADWALKAN ULANG] ", "")}
)}
```

**description** (line ~332-339):

```typescript
// BEFORE:
{
  consultation.notes &&
    consultation.status !== "DECLINED" &&
    !consultation.notes.includes("[DIJADWALKAN ULANG]") && (
      <p className="text-sm text-gray-800">{consultation.notes}</p>
    );
}

// AFTER:
{
  consultation.description && (
    <div>
      <label className="text-sm font-semibold text-gray-700">
        Deskripsi dari Anda:
      </label>
      <p className="text-sm text-gray-800">{consultation.description}</p>
    </div>
  );
}
```

---

## File 4: Minor file (Tes/index.tsx)

**Lokasi**: `client/src/pages/user/Tes/index.tsx` (line ~24)

Kemungkinan cuma test data, ganti `notes:` → `description:` jika ada.

---

## ✅ Checklist After Migration

- [ ] ModalJadwalkanKonseling.tsx: Semua `notes` → `description`
- [ ] KelolaDataKonseling.tsx:
  - [ ] API calls: `notes` → `admin_notes`
  - [ ] Reschedule/Decline display: `consultation.notes` → `consultation.admin_notes`
  - [ ] Regular notes display: tambahkan `consultation.description`
- [ ] ConsultationInfo.tsx:
  - [ ] Admin notes (reschedule/decline): `consultation.notes` → `consultation.admin_notes`
  - [ ] Description: `consultation.notes` → `consultation.description`
- [ ] Test API calls dengan server running
- [ ] Verify di UI bahwa:
  - User bisa input description saat buat konsultasi
  - Admin bisa lihat description dari user
  - Admin notes (reschedule/decline) tampil terpisah

---

## 🚀 Quick Start (Recommended)

1. **Generate Prisma Client** (server):

   ```bash
   cd server
   npx prisma generate
   ```

2. **Restart server** agar Prisma client terupdate

3. **Update frontend files** sesuai guide di atas

4. **Test flow**:
   - User buat konsultasi dengan description
   - Admin reschedule → lihat admin_notes
   - Admin decline → lihat admin_notes
   - User lihat info konsultasi → lihat description & admin_notes terpisah

---

## 💡 Tips

- Gunakan **Multi-cursor** di VS Code (Ctrl+D) untuk edit cepat
- Test satu file dulu sebelum lanjut ke file berikutnya
- Jika error TypeScript, check apakah sudah import type Consultation dari `@/types/consultation`

---

Semoga membantu! 🎉
