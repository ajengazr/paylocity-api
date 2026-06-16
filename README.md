# 📊 Paylocity - Internal Payroll & Leave Management System

Paylocity adalah sistem payroll internal (*single-tenant*) perusahaan yang dikembangkan sebagai tugas akhir pelatihan React Lanjutan. Sistem ini mengintegrasikan manajemen data karyawan, departemen, jabatan, penggajian otomatis berbasis performa/lembur, serta sistem pengajuan cuti yang terintegrasi.

---

## 📝 Deskripsi Proyek

Sistem ini dirancang khusus untuk mengotomatisasi proses birokrasi internal satu perusahaan (*single-tenant*). Aplikasi ini membagi hak akses ke dalam 3 role utama (**SUPER_ADMIN**, **HR_ADMIN**, dan **EMPLOYEE**) tanpa adanya registrasi publik untuk menjaga keamanan data internal. 

Fokus pengembangan saat ini adalah menyelesaikan implementasi **Frontend fitur Cuti (Leave Request)**, di mana sisi *backend* telah selesai 100% dengan validasi berkala (seperti *anti-bentrok* tanggal dan kalkulasi otomatis hari kerja).

---

## ✨ Fitur Utama

### 🔐 Autentikasi & Otorisasi
- **Multi-role Role-Based Access Control (RBAC):** Pemisahan hak akses ketat antara `SUPER_ADMIN`, `HR_ADMIN`, dan `EMPLOYEE`.
- **Secure Auth:** Autentikasi berbasis JWT dengan enkripsi *password* menggunakan Argon2 di sisi backend.

### 👥 Manajemen Data Master
- **Employee CRUD:** Pengelolaan data profil, NIK unik, gaji pokok, dan status pajak.
- **Department & Position CRUD:** Struktur organisasi yang adaptif (Jabatan terikat langsung ke Departemen).
- **Admin Management:** Manajemen akun `HR_ADMIN` khusus oleh `SUPER_ADMIN`.

### 💰 Penggajian & Lembur (Payroll & Overtime)
- **Overtime Engine:** Pengajuan lembur oleh karyawan, persetujuan oleh HR, dan otomatisasi kalkulasi upah lembur ke slip gaji.
- **One-Click Payroll:** Pemrosesan gaji seluruh karyawan aktif hanya dengan satu klik per periode. Status otomatis terkunci (*locked*) setelah diproses.
- **Digital Payslip:** Transparansi slip gaji yang dapat diunduh/dilihat langsung oleh karyawan bersangkutan.

### 📅 Sistem Cuti (Leave Request) — *Current Development*
- **Employee Dashboard:** Pengajuan cuti (Tahunan, Sakit, Melahirkan, Penting) dengan penghitungan otomatis hari efektif kerja (Sabtu/Minggu diabaikan) serta pembatalan mandiri jika status masih *Pending*.
- **HR Approval Workflow:** Validasi status persetujuan terpusat menggunakan `CrudTemplate` dengan catatan penolakan (*rejectedNote*) yang bersifat wajib.

---

## 🛠️ Tech Stack

### Frontend
- **Core:** React.js (Vite)
- **Styling:** Tailwind CSS
- **State & Context:** AuthContext, ThemeContext (Dark/Light Mode), ToastContext
- **HTTP Client:** Axios (baseURL: `http://localhost:3000`, `withCredentials: true`)
- **Animation:** Framer Motion (menggunakan preset dari `src/animations/variants.js`)
- **Package Manager:** `pnpm` (Running on port `5173`)

### Backend & Database
- **Runtime & Framework:** Node.js + Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Validation:** Joi

---

## 📐 Entity Relationship Diagram (ERD)

Berikut adalah representasi relasi basis data berdasarkan skema Prisma terbaru:
