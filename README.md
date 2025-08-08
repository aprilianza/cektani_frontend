# **CekTani – Frontend Documentation**

Frontend ini adalah bagian antarmuka pengguna dari platform **CekTani**, yang dibangun untuk mempermudah petani dan masyarakat umum mengakses layanan deteksi penyakit tanaman, prakiraan cuaca, konsultasi asisten virtual, dan forum diskusi secara cepat, intuitif, dan responsif.

---

## **1. Arsitektur Frontend**

- **Framework**: Next.js – React framework dengan dukungan SSR & SSG.
- **Styling**:
    - **Tailwind CSS** → styling cepat dan konsisten.
    - **Shadcn UI** → komponen UI siap pakai dan modern.
- **Integrasi API**:
    - Berkomunikasi dengan **Backend FastAPI** untuk autentikasi, manajemen data, diagnosis AI, dan forum diskusi.
    - Berkomunikasi dengan **Openmeteo** untuk mendapatkan data cuaca
- **Optimasi UX**:
    - Responsif di semua perangkat (mobile, tablet, desktop).
    - Desain intuitif untuk pengguna dengan latar belakang pendidikan beragam.

---
## **2. Halaman pada Frontend**

1. **Landing Page**
    - Tampilan awal aplikasi.
    - Menampilkan informasi umum tentang CekTani, manfaat, dan fitur utama.
    - Tombol navigasi untuk login atau registrasi.
2. **Dashboard Utama**
    - Ringkasan tanaman pengguna.
    - Informasi cuaca terkini.
    - Riwayat diagnosis singkat.
    - Navigasi cepat ke halaman lain.
3. **Asisten Virtual**
    - Chat interaktif dengan *Pak Tani* (AI berbasis Gemini + RAG).
    - Menjawab pertanyaan pertanian secara kontekstual.
    - Dapat memanfaatkan data cuaca dan riwayat diagnosis.
4. **Kelola Tanaman**
    - Menampilkan daftar tanaman pengguna.
    - Form tambah tanaman baru.
    - Edit atau hapus tanaman.
    - Melihat riwayat diagnosis tanaman.
5. **Forum Diskusi**
    - Menampilkan daftar topik diskusi komunitas.
    - Membuat diskusi baru.
    - Membalas dan mengedit postingan.

---

## **3. Instalasi & Menjalankan Frontend**

```bash

# Clone repository
git clone https://github.com/username/cek-tani-frontend.git
cd cek-tani-frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev

# Buka di browser
http://localhost:3000

```

---

## **4. Konfigurasi Environment**

Buat file `.env.local` untuk menyimpan URL backend dan API eksternal:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8080
```

---

## **5. Alur Integrasi dengan Backend**

Frontend melakukan request HTTP ke endpoint backend:

- Autentikasi → `/auth/*`
- Data tanaman → `/plants/*`
- Diagnosis → `/diagnose/*`
- Chatbot → `/ai/chatbot`
- Cuaca → `/ai/weather/analyze`
- Forum → `/discussions/*`


