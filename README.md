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
- **Optimasi UX**:
    - Responsif di semua perangkat (mobile, tablet, desktop).
    - Desain intuitif untuk pengguna dengan latar belakang pendidikan beragam.

---

## **2. Fitur Pada Frontend**

1. **Autentikasi Pengguna**
    - Registrasi dan login dengan validasi form.
    - Penyimpanan token JWT di local storage.

2. **Dashboard Utama**
    - Ringkasan tanaman, cuaca terkini, dan riwayat diagnosis.
    - Navigasi cepat ke semua fitur.
3. **AI Diagnosis**
    - Upload foto daun untuk deteksi penyakit.
    - Menampilkan hasil diagnosis dari model YOLOv11n.
    - Menampilkan saran penanganan dari asisten virtual.
4. **Analisis Cuaca**
    - Ambil lokasi pengguna.
    - Menampilkan prakiraan cuaca dari Open Meteo API.
    - Analisis kondisi cuaca terkait pertanian.
5. **Chatbot Pak Tani**
    - Chat interaktif dengan asisten virtual berbasis Gemini + RAG.
    - Jawaban dikontekstualisasikan dari basis pengetahuan ChromaDB.
6. **Manajemen Tanaman**
    - List tanaman yang dimiliki pengguna.
    - Tambah, edit, hapus tanaman.
    - Melihat riwayat diagnosis setiap tanaman.
7. **Forum Diskusi**
    - List topik diskusi.
    - Membuat diskusi baru.
    - Balas diskusi dan edit postingan.

---

## **4. Instalasi & Menjalankan Frontend**

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

## **5. Konfigurasi Environment**

Buat file `.env.local` untuk menyimpan URL backend dan API eksternal:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8080
```

---

## **6. Alur Integrasi dengan Backend**

Frontend melakukan request HTTP ke endpoint backend:

- Autentikasi → `/auth/*`
- Data tanaman → `/plants/*`
- Diagnosis → `/diagnose/*`
- Chatbot → `/ai/chatbot`
- Cuaca → `/ai/weather/analyze`
- Forum → `/discussions/*`


