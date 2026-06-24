@echo off
:: Setel Code Page ke UTF-8 untuk mendukung karakter Jepang/ドキュメント
chcp 65001 >nul

:: Cek Hak Akses Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Harap jalankan skrip ini sebagai Administrator!
    echo Klik kanan file ini lalu pilih "Run as administrator".
    pause
    exit /b
)

:: Setel Folder Jalur Asal secara otomatis dari lokasi file .bat ini berada
SET "SOURCE_DIR=%~dp0"
:: Hilangkan backslash (\) di akhir jika ada
IF "%SOURCE_DIR:~-1%"=="\" SET "SOURCE_DIR=%SOURCE_DIR:~0,-1%"

:: Folder Tujuan
SET "DEST_DIR=C:\Kuliah\Pemograman Web Berbasis Framework\Digital Library System"

echo ============================================================
echo      PROSES RELOKASI PROYEK DIGITAL LIBRARY SYSTEM
echo ============================================================
echo Asal:    %SOURCE_DIR%
echo Tujuan:  %DEST_DIR%
echo ============================================================
echo.

:: 1. Hapus folder node_modules sebelum pemindahan
echo [1/5] Menghapus folder node_modules lama (agar pemindahan instan)...
if exist "%SOURCE_DIR%\node_modules" (
    echo - Menghapus node_modules di root...
    rmdir /S /Q "%SOURCE_DIR%\node_modules"
)
if exist "%SOURCE_DIR%\backend\node_modules" (
    echo - Menghapus node_modules di backend...
    rmdir /S /Q "%SOURCE_DIR%\backend\node_modules"
)
if exist "%SOURCE_DIR%\frontend\node_modules" (
    echo - Menghapus node_modules di frontend...
    rmdir /S /Q "%SOURCE_DIR%\frontend\node_modules"
)
echo.

:: 2. Buat folder tujuan jika belum ada
echo [2/5] Menyiapkan folder tujuan di Drive C...
if not exist "%DEST_DIR%" (
    mkdir "%DEST_DIR%"
    echo - Folder tujuan berhasil dibuat.
) else (
    echo - Folder tujuan sudah ada.
)
echo.

:: 3. Salin seluruh file termasuk hidden file (.git, .env) menggunakan xcopy
echo [3/5] Memindahkan file proyek menggunakan xcopy (termasuk .git dan .env)...
xcopy "%SOURCE_DIR%" "%DEST_DIR%" /E /H /K /Y /I
if %errorLevel% neq 0 (
    echo [ERROR] Gagal memindahkan file ke folder tujuan.
    pause
    exit /b
)
echo - Pemindahan file berhasil.
echo.

:: 4. Pindah ke direktori baru dan bangun ulang node_modules
echo [4/5] Membangun ulang dependensi proyek di folder baru (npm install)...
cd /d "%DEST_DIR%"

echo - Menjalankan npm install di Root...
call npm install

if exist "backend" (
    echo - Menjalankan npm install di Backend...
    cd backend
    call npm install
    cd ..
)

if exist "frontend" (
    echo - Menjalankan npm install di Frontend...
    cd frontend
    call npm install
    cd ..
)
echo.

:: 5. Sinkronisasi Git lokal baru dengan GitHub
echo [5/5] Melakukan Git Commit dan Push ke GitHub dari folder baru...
git add .
git commit -m "chore: relocate project directory to global framework repository"
git push origin main
if %errorLevel% neq 0 (
    echo [WARNING] Git push gagal. Silakan periksa koneksi internet atau hak akses repositori Anda.
) else (
    echo - Git push ke GitHub sukses!
)
echo.

echo ============================================================
echo   PROSES SELESAI! Proyek berhasil direlokasi ke:
echo   "%DEST_DIR%"
echo ============================================================
pause
