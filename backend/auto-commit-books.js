const db = require('./config/db');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const booksToInsert = [
  { judul: 'Bumi', penulis: 'Tere Liye', penerbit: 'Gramedia Pustaka Utama', tahun_terbit: 2014, stok: 5 },
  { judul: 'Bulan', penulis: 'Tere Liye', penerbit: 'Gramedia Pustaka Utama', tahun_terbit: 2015, stok: 6 },
  { judul: 'Matahari', penulis: 'Tere Liye', penerbit: 'Gramedia Pustaka Utama', tahun_terbit: 2016, stok: 4 },
  { judul: 'Bintang', penulis: 'Tere Liye', penerbit: 'Gramedia Pustaka Utama', tahun_terbit: 2017, stok: 5 },
  { judul: 'Ceros dan Batozar', penulis: 'Tere Liye', penerbit: 'Gramedia Pustaka Utama', tahun_terbit: 2018, stok: 3 },
  { judul: 'Komet', penulis: 'Tere Liye', penerbit: 'Gramedia Pustaka Utama', tahun_terbit: 2018, stok: 5 },
  { judul: 'Komet Minor', penulis: 'Tere Liye', penerbit: 'Gramedia Pustaka Utama', tahun_terbit: 2019, stok: 4 },
  { judul: 'Selena', penulis: 'Tere Liye', penerbit: 'Gramedia Pustaka Utama', tahun_terbit: 2020, stok: 5 },
  { judul: 'Nebula', penulis: 'Tere Liye', penerbit: 'Gramedia Pustaka Utama', tahun_terbit: 2020, stok: 5 },
  { judul: 'Si Putih', penulis: 'Tere Liye', penerbit: 'Gramedia Pustaka Utama', tahun_terbit: 2021, stok: 3 }
];

const databaseSqlPath = path.join(__dirname, 'database.sql');

async function runAutoCommit() {
  console.log('Memulai proses auto-commit untuk 10 buku baru...');
  
  // Make sure we are on the main branch
  try {
    const currentBranch = execSync('git branch --show-current').toString().trim();
    if (currentBranch !== 'main') {
      console.log(`Pindah ke branch main (saat ini: ${currentBranch})...`);
      execSync('git checkout main');
    }
  } catch (err) {
    console.error('Gagal memeriksa/berpindah branch git:', err.message);
    process.exit(1);
  }

  for (let i = 0; i < booksToInsert.length; i++) {
    const book = booksToInsert[i];
    console.log(`\n[Buku ${i + 1}/10] Memproses: "${book.judul}"`);

    try {
      // 1. Insert into local MySQL Database
      const query = 'INSERT INTO books (judul, penulis, penerbit, tahun_terbit, stok) VALUES (?, ?, ?, ?, ?)';
      await db.query(query, [book.judul, book.penulis, book.penerbit, book.tahun_terbit, book.stok]);
      console.log(`- Berhasil menambahkan ke database local.`);

      // 2. Append SQL insert statement to database.sql file
      const sqlStatement = `\n-- Buku Tambahan #${i + 1}\nINSERT INTO books (judul, penulis, penerbit, tahun_terbit, stok) VALUES ('${book.judul.replace(/'/g, "\\'")}', '${book.penulis.replace(/'/g, "\\'")}', '${book.penerbit.replace(/'/g, "\\'")}', ${book.tahun_terbit}, ${book.stok});\n`;
      fs.appendFileSync(databaseSqlPath, sqlStatement, 'utf8');
      console.log(`- Berhasil menulis query ke database.sql.`);

      // 3. Git Add
      execSync(`git add "${databaseSqlPath}"`);
      console.log(`- Git add sukses.`);

      // 4. Git Commit
      const commitMessage = `feat: add book '${book.judul}' to library catalog`;
      execSync(`git commit -m "${commitMessage}"`);
      console.log(`- Git commit sukses: "${commitMessage}"`);

      // 5. Git Push
      console.log(`- Mengunggah (pushing) ke GitHub...`);
      execSync('git push origin main');
      console.log(`- Git push sukses!`);

      // Sleep/delay 1.5 seconds to avoid pushing conflicts
      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (error) {
      console.error(`Gagal memproses buku "${book.judul}":`, error.message);
      // Continue to next book to keep process going if one fails
    }
  }

  console.log('\nSeluruh proses selesai! 10 buku baru telah ditambahkan ke database lokal dan di-commit/push ke GitHub.');
  process.exit(0);
}

runAutoCommit();
