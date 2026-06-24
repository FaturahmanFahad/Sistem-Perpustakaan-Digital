# Dokumentasi Spesifikasi Autentikasi (Auth Spec)

Dokumentasi teknis pengerjaan otorisasi dan sistem backend dasar:

### Fitur #1: define base auth controller structure
- **Detail:** Mendefinisikan struktur kelas AuthController untuk registrasi dan login.
- **Status:** Implementasi dasar selesai.

### Fitur #2: add email validation regex helper
- **Detail:** Menambahkan modul utilitas validasi format email menggunakan RegEx standar RFC 5322.
- **Status:** Implementasi dasar selesai.

### Fitur #3: configure JWT signature expiration settings
- **Detail:** Mengonfigurasi masa aktif JWT token selama 1 hari (1d) dan salt bcrypt sebanyak 10 rounds.
- **Status:** Implementasi dasar selesai.
