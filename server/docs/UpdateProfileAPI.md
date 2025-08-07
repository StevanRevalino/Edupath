# Update Profile API Documentation

## Endpoint

`PUT /api/auth/update-profile`

## Description

Endpoint untuk mengupdate profil user (nama depan, nama belakang, dan kelas).
**Validasi dilakukan di frontend menggunakan Yup.**

## Headers

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

## Request Body

```json
{
  "firstname": "string (optional)",
  "lastname": "string (optional)",
  "kelas": "number (optional)"
}
```

## Response Success (200)

```json
{
  "message": "Profil berhasil diperbarui",
  "user": {
    "user_id": "US001",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "kelas": 11,
    "created_at": "2025-08-07T10:00:00.000Z"
  }
}
```

## Response Error (400)

```json
{
  "message": "Tidak ada data yang akan diperbarui"
}
```

atau

```json
{
  "message": "User tidak ditemukan"
}
```

## Response Error (401)

```json
{
  "message": "User tidak terautentikasi"
}
```

## Validasi

- **Backend**: Hanya validasi dasar (user exists, token valid)
- **Frontend**: Validasi lengkap menggunakan Yup schema
- Minimal salah satu field harus ada untuk update

## Contoh Usage

### Update hanya nama depan

```javascript
fetch("/api/auth/update-profile", {
  method: "PUT",
  headers: {
    Authorization: "Bearer your_token",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    firstname: "Jane",
  }),
});
```

### Update semua field

```javascript
fetch("/api/auth/update-profile", {
  method: "PUT",
  headers: {
    Authorization: "Bearer your_token",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    firstname: "Jane",
    lastname: "Smith",
    kelas: 12,
  }),
});
```
