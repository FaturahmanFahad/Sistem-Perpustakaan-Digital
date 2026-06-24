-- Drop Database if exists to allow fresh reset
DROP DATABASE IF EXISTS perpus_digital;
CREATE DATABASE perpus_digital;
USE perpus_digital;

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Books Table
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    penulis VARCHAR(150) NOT NULL,
    penerbit VARCHAR(150) NOT NULL,
    tahun_terbit INT NOT NULL,
    stok INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Borrowings Table (Transaction Table)
CREATE TABLE IF NOT EXISTS borrowings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    tanggal_pinjam DATE NOT NULL,
    tanggal_kembali DATE DEFAULT NULL,
    status ENUM('dipinjam', 'kembali') NOT NULL DEFAULT 'dipinjam',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Mock Data for Testing
-- Default Admin: admin@perpus.com / admin123 (password is plaintext here for ref; will be hashed in backend testing)
-- Default User: user@perpus.com / user123
INSERT INTO users (username, email, password, role) VALUES 
('Admin Perpustakaan', 'admin@perpus.com', '$2a$10$tMh4Hk9R4y0.pU685Y.kQ.u8nB3xQ47wP/b4jV.2iF9kE57gB2aUq', 'admin'),
('Budi Utomo', 'user@perpus.com', '$2a$10$tMh4Hk9R4y0.pU685Y.kQ.u8nB3xQ47wP/b4jV.2iF9kE57gB2aUq', 'user');

-- Insert Initial Books (50 Realistic Books matching Perpusnas Catalog)
INSERT INTO books (judul, penulis, penerbit, tahun_terbit, stok) VALUES
('Laskar Pelangi', 'Andrea Hirata', 'Bentang Pustaka', 2005, 5),
('Bumi Manusia', 'Pramoedya Ananta Toer', 'Hasta Mitra', 1980, 3),
('Anak Semua Bangsa', 'Pramoedya Ananta Toer', 'Hasta Mitra', 1981, 4),
('Jejak Langkah', 'Pramoedya Ananta Toer', 'Hasta Mitra', 1985, 3),
('Rumah Kaca', 'Pramoedya Ananta Toer', 'Hasta Mitra', 1988, 2),
('Cantik Itu Luka', 'Eka Kurniawan', 'Gramedia Pustaka Utama', 2002, 4),
('Ronggeng Dukuh Paruk', 'Ahmad Tohari', 'Gramedia Pustaka Utama', 1982, 5),
('Pulang', 'Leila S. Chudori', 'Kepustakaan Populer Gramedia', 2012, 6),
('Laut Bercerita', 'Leila S. Chudori', 'Kepustakaan Populer Gramedia', 2017, 8),
('Hujan', 'Tere Liye', 'Gramedia Pustaka Utama', 2016, 10),
('Pulang-Pergi', 'Tere Liye', 'Sabak Grip Nusantara', 2021, 7),
('Negeri 5 Menara', 'A. Fuadi', 'Gramedia Pustaka Utama', 2009, 5),
('Supernova: Ksatria, Puteri, dan Bintang Jatuh', 'Dee Lestari', 'Truedee Books', 2001, 4),
('Perahu Kertas', 'Dee Lestari', 'Bentang Pustaka', 2009, 6),
('Tenggelamnya Kapal Van der Wijck', 'Buya Hamka', 'Bulan Bintang', 1938, 3),
('Di Bawah Lindungan Ka\'bah', 'Buya Hamka', 'Bulan Bintang', 1938, 4),
('Saman', 'Ayu Utami', 'Kepustakaan Populer Gramedia', 1998, 5),
('Dilan: Dia adalah Dilanku Tahun 1990', 'Pidi Baiq', 'Pastel Books', 2014, 12),
('Gadis Kretek', 'Ratih Kumala', 'Gramedia Pustaka Utama', 2012, 6),
('Robohnya Surau Kami', 'A.A. Navis', 'Gramedia Pustaka Utama', 1956, 4),
('5 Cm', 'Donny Dhirgantoro', 'Grasindo', 2005, 7),
('Madilog', 'Tan Malaka', 'Pusaka Widya', 1943, 3),
('Di Bawah Bendera Revolusi', 'Ir. Soekarno', 'Panitia Penerbit DBR', 1963, 2),
('Habis Gelap Terbitlah Terang', 'R.A. Kartini', 'Balai Pustaka', 1922, 5),
('Catatan Seorang Demonstran', 'Soe Hok Gie', 'LP3ES', 1983, 4),
('Filosofi Teras', 'Henry Manampiring', 'Kompas Penerbit Buku', 2018, 15),
('Seni Tinggal di Bumi', 'Henry Manampiring', 'Kompas Penerbit Buku', 2022, 8),
('Sapiens: Riwayat Singkat Umat Manusia', 'Yuval Noah Harari', 'Kepustakaan Populer Gramedia', 2017, 10),
('Homo Deus: Masa Depan Umat Manusia', 'Yuval Noah Harari', 'Kepustakaan Populer Gramedia', 2018, 5),
('Dunia Sophie', 'Jostein Gaarder', 'Mizan', 1996, 6),
('Sebuah Seni untuk Bersikap Bodo Amat', 'Mark Manson', 'Grasindo', 2018, 12),
('Atomic Habits', 'James Clear', 'Gramedia Pustaka Utama', 2019, 14),
('Metode Penelitian Kuantitatif, Kualitatif, dan R&D', 'Sugiyono', 'Alfabeta', 2013, 20),
('Statistika untuk Penelitian', 'Sugiyono', 'Alfabeta', 2012, 15),
('Sosiologi Suatu Pengantar', 'Soerjono Soekanto', 'Rajawali Pers', 2013, 10),
('Dasar-Dasar Hukum Pidana Indonesia', 'Moeljatno', 'Rineka Cipta', 2008, 8),
('Algoritma dan Pemrograman', 'Rinaldi Munir', 'Informatika Bandung', 2011, 12),
('Pengantar Teknologi Informasi', 'Jogiyanto HM', 'Andi Offset', 2005, 6),
('Komunikasi Organisasi', 'Deddy Mulyana', 'Remaja Rosdakarya', 2007, 7),
('Ekonomi Makro', 'Sadono Sukirno', 'Rajawali Pers', 2010, 9),
('Manajemen Pemasaran', 'Philip Kotler', 'Erlangga', 2009, 10),
('Psikologi Perkembangan', 'Elizabeth B. Hurlock', 'Erlangga', 2002, 5),
('Guns, Germs & Steel', 'Jared Diamond', 'Kepustakaan Populer Gramedia', 2013, 4),
('Sejarah Dunia yang Disembunyikan', 'Jonathan Black', 'Alvabet', 2015, 6),
('Blink: Kemampuan Berpikir Tanpa Berpikir', 'Malcolm Gladwell', 'Gramedia Pustaka Utama', 2007, 5),
('Outliers: Rahasia di Balik Sukses', 'Malcolm Gladwell', 'Gramedia Pustaka Utama', 2009, 6),
('Rich Dad Poor Dad', 'Robert T. Kiyosaki', 'Gramedia Pustaka Utama', 2016, 10),
('The Intelligent Investor', 'Benjamin Graham', 'Gramedia Pustaka Utama', 2018, 4),
('Rahasia Magnet Rezeki', 'Nasrullah', 'Elex Media Komputindo', 2018, 8),
('Think and Grow Rich', 'Napoleon Hill', 'Gramedia Pustaka Utama', 2015, 7);

-- Buku Tambahan #1
INSERT INTO books (judul, penulis, penerbit, tahun_terbit, stok) VALUES ('Bumi', 'Tere Liye', 'Gramedia Pustaka Utama', 2014, 5);

-- Buku Tambahan #2
INSERT INTO books (judul, penulis, penerbit, tahun_terbit, stok) VALUES ('Bulan', 'Tere Liye', 'Gramedia Pustaka Utama', 2015, 6);

-- Buku Tambahan #3
INSERT INTO books (judul, penulis, penerbit, tahun_terbit, stok) VALUES ('Matahari', 'Tere Liye', 'Gramedia Pustaka Utama', 2016, 4);

-- Buku Tambahan #4
INSERT INTO books (judul, penulis, penerbit, tahun_terbit, stok) VALUES ('Bintang', 'Tere Liye', 'Gramedia Pustaka Utama', 2017, 5);
