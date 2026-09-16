# Vibe Coding Backend API

Ini adalah proyek backend API untuk sistem autentikasi pengguna (_User Authentication System_) sederhana namun tangguh. Aplikasi ini menyediakan fitur bagi pengguna untuk mendaftar, _login_, melihat profil saat ini, serta _logout_.

Aplikasi ini dibangun menggunakan arsitektur modern berfokus pada kecepatan dan keamanan validasi tipe data (Type-Safe).

## Technology Stack

- **Runtime**: [Bun](https://bun.sh/) (Runtime JavaScript/TypeScript super cepat pengganti Node.js).
- **Framework**: [ElysiaJS](https://elysiajs.com/) (Web framework berkinerja tinggi untuk Bun).
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) (ORM TypeScript modern dan _type-safe_).
- **Database**: [MySQL](https://www.mysql.com/) (Relational Database Management System).
- **Bahasa**: TypeScript.

## Library Utama yang Digunakan

- `elysia`: Web framework.
- `drizzle-orm`: Object Relational Mapper untuk berinteraksi dengan database secara _type-safe_.
- `drizzle-kit`: CLI untuk Drizzle (menjalankan dan membuat _migrations_ database).
- `mysql2`: _Driver_ database untuk menghubungkan aplikasi ke MySQL.
- `bcryptjs`: _Library_ untuk meng-_hash_ password secara aman.

---

## Arsitektur & Struktur Direktori

Aplikasi ini memisahkan tanggung jawab (Separation of Concerns) ke dalam lapisan-lapisan (_layer_) yang jelas:

```text
.
├── src/
│   ├── index.ts          # Entry point utama aplikasi (Setup server Elysia)
│   ├── db/
│   │   ├── index.ts      # Koneksi database Drizzle
│   │   └── schema.ts     # Definisi skema tabel database
│   ├── routes/           # Layer routing dan validasi input (Controller)
│   │   ├── authRoutes.ts
│   │   └── usersRoutes.ts
│   └── services/         # Layer business logic dan akses database
│       ├── authServices.ts
│       └── usersServices.ts
├── tests/                # Direktori unit & integration test
├── .env                  # Variabel lingkungan (Kredensial DB)
└── package.json          # Konfigurasi dependensi project
```

### Penamaan File

- **`*Routes.ts`** (contoh: `usersRoutes.ts`): Berisi definisi URL _endpoint_ (rute), fungsi untuk mengekstrak _request body/header_, dan menggunakan TypeBox bawaan Elysia untuk memvalidasi input.
- **`*Services.ts`** (contoh: `usersServices.ts`): Berisi _business logic_ inti aplikasi. Route akan memanggil fungsi di _services_ untuk melakukan kalkulasi, hashing, atau membaca/menulis ke database.
- **`*.test.ts`** (contoh: `register.test.ts`): File untuk pengujian terotomatisasi.

---

## Skema Database

Terdapat 2 tabel di dalam aplikasi ini:

### 1. `users`

Menyimpan informasi pengguna yang mendaftar.

- `id` (Serial/BigInt, Primary Key)
- `name` (Varchar 255, Not Null)
- `email` (Varchar 255, Not Null, Unique)
- `password` (Varchar 255, Not Null) - _Disimpan dalam format hash (bcrypt)_.
- `createdAt` (Timestamp, Default Now)

### 2. `sessions`

Menyimpan token aktif untuk setiap login. Jika pengguna logout, record ini akan dihapus.

- `id` (Serial/BigInt, Primary Key)
- `token` (Varchar 255, Not Null)
- `userId` (BigInt Unsigned, Foreign Key ke `users.id`)
- `createdAt` (Timestamp, Default Now)

---

## API Documentation

Seluruh endpoint diawali dengan _prefix_ `/api`.

### 1. Register User

- **Endpoint**: `POST /api/users`
- **Body**:
    ```json
    {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "password123"
    }
    ```
- **Deskripsi**: Mendaftarkan akun baru. Akan divalidasi panjang karakter maksimum (255) dan format _email_.

### 2. Login User

- **Endpoint**: `POST /api/auth/login`
- **Body**:
    ```json
    {
        "email": "john@example.com",
        "password": "password123"
    }
    ```
- **Deskripsi**: Masuk ke dalam sistem. Jika kredensial benar, akan mengembalikan `token` (disimpan juga ke tabel sessions).

### 3. Get Current User

- **Endpoint**: `GET /api/users/current`
- **Headers**:
    - `Authorization: Bearer <token>`
- **Deskripsi**: Mengambil data akun berdasarkan _token_ autentikasi. Akan gagal (HTTP 401) jika token tidak sah atau sesi tidak ada.

### 4. Logout User

- **Endpoint**: `GET /api/users/logout`
- **Headers**:
    - `Authorization: Bearer <token>`
- **Deskripsi**: Menghapus data sesi dari _database_, membuat _token_ yang digunakan menjadi tidak berlaku lagi.

---

## Cara Setup Project

1. **Clone repository ini** (jika melalui Git).
2. **Install dependensi**:
   Gunakan package manager dari Bun:
    ```bash
    bun install
    ```
3. **Konfigurasi Database**:
    - Buat database baru di MySQL server Anda (contoh nama: `vibe_coding`).
    - Buat file `.env` di _root folder_ proyek.
    - Tambahkan variabel koneksi (sesuaikan dengan MySQL Anda):
        ```env
        DATABASE_URL="mysql://username:password@localhost:3306/vibe_coding"
        ```
4. **Push Schema ke Database**:
    - Terapkan struktur tabel `users` dan `sessions` ke MySQL menggunakan Drizzle:
        ```bash
        bun run db:push
        ```

## Cara Menjalankan Aplikasi

Anda dapat menjalankan _server_ aplikasi dengan dua cara:

- **Mode Development** (_Auto-restart_ saat ada perubahan file):
    ```bash
    bun run dev
    ```
- **Mode Production**:
    ```bash
    bun run start
    ```
    _Server akan berjalan secara default di `http://localhost:3000` atau sesuai port di Bun config._

## Cara Menjalankan Test (Pengujian)

Aplikasi ini dilengkapi dengan sekumpulan _Integration Test_ & _Unit Test_ lengkap untuk memastikan kualitas kode dan keamanan dari regresi data. Pengujian berjalan dengan cepat secara native menggunakan API `bun:test`.

Untuk menjalankan semua pengujian:

```bash
bun test
```

_Catatan: Pastikan koneksi database Anda menyala, karena test akan melakukan setup/teardown (hapus data) secara otomatis di tabel test Anda._
