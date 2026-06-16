<div align="center">

# 💼 Paylocity
### *Sistem Payroll & Manajemen Karyawan Internal Modern*

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---
</div>

## 📌 Deskripsi Proyek

**Paylocity** adalah sistem payroll internal berbasis *single-tenant* yang dirancang untuk mengelola data operasional SDM, kehadiran lembur, perhitungan gaji berkala, cetak slip gaji, serta pengajuan cuti secara terintegrasi. 

Aplikasi ini membagi hak akses ke dalam **3 Peran Utama**:
*   👑 **SUPER_ADMIN**: Memegang kontrol mutlak atas sistem, termasuk pembuatan akun administrator HR dan pengelolaan basis data utama.
*   🛡️ **HR_ADMIN**: Mengelola data operasional karyawan (CRUD), departemen, posisi, menyetujui klaim lembur/cuti, serta memproses payroll berkala.
*   👥 **EMPLOYEE**: Mengakses dashboard personal untuk meninjau slip gaji secara mandiri, mengajukan lembur, serta mengelola pengajuan cuti (*leave request*).

---

## 🛑 Batasan Proyek (Constraints)

> [!IMPORTANT]
> Proyek ini dibangun di bawah aturan ketat standardisasi kode React Lanjutan. Seluruh pengembang wajib menaati batas-batas teknis berikut:

| Kategori | Batasan / Larangan | Solusi yang Digunakan |
| :--- | :--- | :--- |
| **Framework & Library** | ❌ Dilarang menggunakan Angular, Vue, Svelte, Bootstrap, jQuery, dan AJAX. | Menggunakan ekosistem **React & Tailwind CSS**. |
| **Sintaks JavaScript** | ❌ Dilarang menggunakan deklarasi variabel `var`. | Selalu gunakan `const` dan `let`. |
| **Server Rendering** | ❌ Dilarang menggunakan *template engine* di backend. | Menggunakan arsitektur pemisahan API penuh (RESTful API). |
| **DOM Manipulation** | ❌ Dilarang memanipulasi DOM langsung (`innerHTML`, `querySelector()`, dll). | Perubahan tampilan sepenuhnya dikelola secara deklaratif via state React. |
| **Scrolling** | ❌ Dilarang menggunakan `window.scrollTo` secara langsung. | Menggunakan mekanisme React `ref` jika membutuhkan kontrol posisi scroll. |

---

## 🛠️ Tech Stack & Library

### Frontend
*   **Core**: React (Vite) berjalan pada port `5173`
*   **Styling**: Tailwind CSS (Desain modern dan responsif)
*   **Animation**: Framer Motion (Transisi halus menggunakan preset `src/animations/variants.js`)
*   **HTTP Client**: Axios (Terkonfigurasi dengan `withCredentials: true` pada `baseURL: http://localhost:3000`)
*   **State & Context**: `AuthContext` (Sesi login & role), `ThemeContext` (Dark/Light Mode), `ToastContext`
*   **Package Manager**: `pnpm`

### Backend & Database
*   **Runtime**: Node.js + Express.js
*   **Database ORM**: Prisma Client
*   **Engine Database**: PostgreSQL
*   **Security & Auth**: JWT (JSON Web Token) + Argon2 (Enkripsi password)
*   **Data Validation**: Joi validator

---

## 📊 Entity Relationship Diagram (ERD)

### 🗺️ Skema Alur Hubungan (ASCII Mode)

```text
  ┌──────────┐          1 : 1          ┌──────────┐
  │  users   ├────────────────────────>│employees │
  └──────────┘                         └────┬─────┘
                                            │
         ┌──────────────────────────────────┼──────────────────────────────────┐
         │ 1 : N                            │ 1 : N                            │ 1 : N
         ▼                                  ▼                                  ▼
  ┌──────────┐                         ┌──────────┐                       ┌──────────────┐
  │overtimes │                         │ payslips │                       │leave_requests│
  └──────────┘                         └────▲─────┘                       └──────────────┘
                                            │ 1 : N
                                       ┌────┴─────┐
                                       │ payrolls │
                                       └──────────┘

  ┌────────────┐        1 : N          ┌──────────┐        1 : N          ┌──────────┐
  │departments ├──────────────────────>│positions ├──────────────────────>│employees │
  └──────┬─────┘                       └──────────┘                       └──────────┘
         │
         └─────────────────────────────────────────────────────────────────────▲
                                        1 : N                                  │
                                                                               (departments-to-employees)
```

### 🔗 Hubungan Kunci Antar Tabel (Foreign Keys)

| Tabel Asal | Tabel Tujuan | Kolom Penghubung | Tipe Relasi | Fungsi Hubungan |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `employees` | `employees.userId` -> `users.id` | 1-to-1 | Akun otentikasi milik profil karyawan. |
| `departments` | `positions` | `positions.departmentId` -> `departments.id` | 1-to-many | Divisi yang menaungi jabatan kerja. |
| `departments` | `employees` | `employees.departmentId` -> `departments.id` | 1-to-many | Divisi tempat karyawan bekerja. |
| `positions` | `employees` | `employees.positionId` -> `positions.id` | 1-to-many | Jabatan spesifik yang diisi karyawan. |
| `employees` | `overtimes` | `overtimes.employeeId` -> `employees.id` | 1-to-many | Log pengajuan lembur per individu. |
| `employees` | `leave_requests` | `leave_requests.employeeId` -> `employees.id` | 1-to-many | Log pengajuan cuti per individu. |
| `employees` | `payslips` | `payslips.employeeId` -> `employees.id` | 1-to-many | Daftar slip gaji bulanan yang diterima karyawan. |
| `payrolls` | `payslips` | `payslips.payrollId` -> `payrolls.id` | 1-to-many | Dokumen induk payroll yang menampung slip bulanan. |

---

## ✨ Fitur Utama (Seluruhnya Selesai)

Seluruh cakupan fitur di dalam aplikasi ini telah selesai dikembangkan secara tuntas baik pada sisi **Backend (API & DB)** maupun **Frontend (UI & State)**:

### 🔐 Autentikasi & Keamanan
*   **Multi-Role Shield**: Pembagian dashboard dinamis untuk `SUPER_ADMIN`, `HR_ADMIN`, dan `EMPLOYEE`.
*   **Auto-Seed System**: Akun `SUPER_ADMIN` otomatis terbuat saat inisialisasi server untuk akses awal sistem.
*   **Secure Cookies**: Sesi login berbasis HTTP-only cookies JWT.

### 🏢 Manajemen Data Internal (Admin Panel)
*   **Karyawan (Employee) CRUD**: Pengelolaan profil, gaji pokok, status pajak, dan riwayat bergabung karyawan.
*   **Departemen & Jabatan CRUD**: Pengelolaan struktur hierarki divisi kerja secara dinamis.
*   **HR Admin CRUD**: Hak istimewa bagi `SUPER_ADMIN` untuk mendaftarkan dan mematikan akses akun admin HR.

### 💵 Penggajian (Payroll & Slip Gaji)
*   **One-Click Processor**: Fitur kalkulasi gaji seluruh karyawan aktif sekaligus secara otomatis dalam satu klik.
*   **Auto-Lock System**: Data penggajian dikunci secara permanen setelah diproses guna menghindari manipulasi data historis.
*   **Flexible Access**: Slip Gaji dapat dicetak dan ditinjau oleh masing-masing karyawan, serta dimonitor secara berkala oleh Admin.

### ⏱️ Manajemen Lembur (Overtime)
*   **Request & Approval**: Pengajuan jam lembur mandiri oleh karyawan dengan proses persetujuan oleh HR Admin.
*   **Direct Inserter**: Kemudahan input lembur instan oleh Admin yang langsung disetujui (*direct APPROVED*).

### 📅 Sistem Pengajuan Cuti (Leave Request)
*   **Dashboard Admin (`/dashboard/cuti`)**:
    *   Tabel rekapitulasi data pengajuan cuti yang responsif menggunakan komponen `CrudTemplate`.
    *   Filter visual interaktif berdasarkan **Status Cuti** dan **Jenis Cuti**.
    *   Fungsionalitas persetujuan instan (*Approve*) atau penolakan (*Reject*) dengan kewajiban menuliskan alasan penolakan (`rejectedNote`) melalui modal transisi.
    *   Sistem pewarnaan badge yang konsisten: `PENDING` (kuning), `APPROVED` (hijau), dan `REJECTED` (merah).
    *   Keamanan akses: Hanya `SUPER_ADMIN` yang memiliki hak akses penghapusan data cuti (`canDelete`).
*   **Dashboard Karyawan (`/dashboard/my-cuti`)**:
    *   Pemantauan sisa pengajuan cuti dan pelacakan status secara real-time.
    *   Formulir pengajuan interaktif dengan kalender dinamis.
    *   Sistem penghitungan otomatis jumlah hari cuti (`totalDays`) yang diajukan dengan mengabaikan hari Sabtu dan Minggu (real-time kalkulator).
    *   Pencegahan pengajuan bentrok (aplikasi akan mendeteksi jika tanggal yang dipilih tumpang tindih dengan pengajuan sebelumnya).
    *   Fitur pembatalan mandiri yang hanya aktif pada pengajuan berstatus `PENDING`.

---

## 🧬 Panduan Arsitektur & Pola Pemanggilan API

Aplikasi ini menggunakan pola komunikasi terpusat melalui Axios Instance di `src/config/api.js`. Seluruh pemanggilan modul cuti disatukan ke dalam satu API controller di sisi client:

```javascript
const leaveApi = {
  getAll:        () => api.get('/api/leaves'),
  getMy:         () => api.get('/api/leaves/my'),
  getById:       (id) => api.get(`/api/leaves/${id}`),
  create:        (data) => api.post('/api/leaves', data),
  updateStatus:  (id, data) => api.patch(`/api/leaves/${id}/status`, data),
  delete:        (id) => api.delete(`/api/leaves/${id}`)
};
```

Setiap transisi halaman dan elemen UI dihiasi oleh preset animasi modern dari `Framer Motion` (`src/animations/variants.js`):
*   `fadeUp`: Digunakan untuk transisi masuk halaman dashboard.
*   `scrollReveal`: Digunakan untuk kemunculan daftar baris tabel dan komponen kartu data.
*   `scaleUp`: Digunakan saat membuka jendela konfirmasi modal (*Approve/Reject*).

---

## 🚀 Panduan Menjalankan Proyek

### 🔌 Menjalankan Backend (API Server)
1. Pindah ke direktori backend:
   ```bash
   cd backend
   ```
2. Buat file `.env` hasil salinan dari `.env.example`, lalu isi konfigurasi koneksi database PostgreSQL Anda:
   ```bash
   cp .env.example .env
   ```
3. Instal semua paket dependensi:
   ```bash
   pnpm install
   ```
4. Jalankan sinkronisasi database dan migrasi schema Prisma:
   ```bash
   pnpm prisma db push
   ```
5. Jalankan server dalam mode pengembangan:
   ```bash
   pnpm run dev
   ```

### 💻 Menjalankan Frontend (Client Application)
1. Pindah ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Instal semua paket dependensi:
   ```bash
   pnpm install
   ```
3. Jalankan aplikasi client:
   ```bash
   pnpm run dev
   ```
4. Aplikasi siap diakses melalui peramban pada alamat: `http://localhost:5173`

---
<div align="center">
  <sub>Paylocity System • By Ajeng Azzahra Maharani</sub>
</div>
