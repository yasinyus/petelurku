<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/f40ced6e-1127-4ff6-a5ce-6e9eb43a5f32

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Buat file `.env` dari `.env.example`, lalu isi konfigurasi MySQL lokal Anda.
   Secara default aplikasi menggunakan `localhost:3306`, user `root`, dan database `kandang_baru`.
3. Jalankan migrasi untuk membuat tabel dan data awal:
   `npm run db:migrate`
4. Jalankan aplikasi:
   `npm run dev`

Status koneksi dapat diperiksa di `http://localhost:3000/api/health`. Aplikasi tidak
lagi memakai fallback data memori ketika MySQL tidak tersedia; API akan mengembalikan
error agar data yang dimasukkan tidak terlihat seolah-olah telah tersimpan.
