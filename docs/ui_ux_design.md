# Dokumentasi UI/UX SiPinjam Kampus

*Oleh: Lead UI/UX Designer*

---

## 1. Objektif & Filosofi Desain

Tujuan utama dari perancangan ulang sistem peminjaman kampus ini adalah untuk menciptakan aplikasi yang bersih, modern, profesional, dan intuitif—sebuah produk kelas atas (*premium-looking*) dengan fungsionalitas kelas atas tanpa mengorbankan kegunaan (*usability*).

Sistem ini didesain agar sebanding dengan produk SaaS modern terbaik seperti **Linear, Notion, Stripe Dashboard,** atau **Vercel Dashboard**, dan membuang jauh stigma "sistem akademik kuno".

**Panduan Gaya Utama (Design Style):**

- Modern SaaS & Minimalis
- Fungsionalitas lebih diutamakan dibanding dekorasi berlebih (*Functional over decorative*)
- *Soft UI* (tetapi bukan *neumorphism*)
- **Larangan Keras:** Dilarang berlebihan menggunakan *gradients*, *glassmorphism*, warna *neon*, atau animasi berlebihan yang dapat menurunkan fungsionalitas.

---

## 2. Bahasa Visual & Tata Letak (Visual Language & Layout)

Sistem ini menggunakan bahasa visual yang lapang dan bernapas:

- **Grid Sistem:** Konsisten menggunakan sistem *spacing* kelipatan 8px.
- **Ruang Kosong (Whitespace):** Penggunaan whitespace yang masif untuk mengurangi beban kognitif.
- **Bentuk (Shapes):** Sudut membulat (*rounded corners*) sebesar 16–20px untuk kesan ramah namun profesional.
- **Kedalaman (Depth):** Bayangan halus (*soft shadows*) dengan opasitas sangat rendah.
- **Garis Batas (Borders):** Garis tipis `#E5E7EB` (Tailwind `slate-200` / `gray-200`) untuk mendefinisikan batas *Card*.
- **Latar Belakang:** Latar terang `#F8FAFC` (Tailwind `slate-50`) memberikan kontras yang sempurna untuk kartu-kartu konten berwarna putih.
- **Tata Letak Utama:** Antarmuka berbasis *Card*, menu navigasi atas yang *sticky*, *sidebar* responsif, serta *padding* yang merata di semua dimensi layar (Desktop, Tablet, Mobile).

---

## 3. Sistem Warna & Tipografi

Menggunakan palet warna minimalis untuk mencegah aplikasi terlihat kekanak-kanakan.

**Warna Semantic:**

- **Primary:** Biru (`#2563EB`) — Untuk tindakan utama.
- **Success:** Hijau (`#22C55E`) — Tersedia / Sukses.
- **Warning:** Kuning/Amber (`#F59E0B`) — Menunggu / Terlambat.
- **Danger:** Merah (`#EF4444`) — Ditolak / Denda.
- **Neutral:** Spektrum abu-abu (*Gray palette*) untuk teks sekunder dan garis batas.

**Tipografi:**

- Mengutamakan hierarki visual yang jelas: Judul halaman besar, judul seksi (*section*) dengan *medium-weight*.
- Mengatur *line-height* (jarak antar baris) untuk kenyamanan membaca yang maksimal.
- Ukuran font yang konsisten dan **menghindari penggunaan *bold* teks secara berlebihan**.

---

## 4. Sistem Komponen (Component System)

1. **Tombol (Buttons):** Melengkung, memiliki bayangan halus, memberikan respon visual jelas saat di-*hover*, serta mendukung status *Loading* (memuat) dan *Disabled* (non-aktif). Dilengkapi dengan efek *ripple* ringan / *subtle scale*.
2. **Kartu (Cards):** Sudut 16-20px, bayangan nyaris tak terlihat, border tipis, dan *padding* longgar.
3. **Form Input:** Melengkung dengan indikator *focus* berupa cincin (*focus ring*) yang jelas, dilengkapi teks bantuan (*helper text*) dan validasi status.
4. **Tabel (Tables):**
   - Pemisah baris atau garis *zebra* yang sangat halus.
   - Header statis (*sticky*).
   - Baris yang merespon saat dilewati kursor (*hover highlight*).
   - Dukungan utuh untuk *Pagination*, *Sorting*, *Filtering*, dan *Search*.
5. **Status Badges (Penting):** Status **tidak boleh** direpresentasikan dengan teks polos. Harus menggunakan *badge* berwana cerah:
   - 🟢 Tersedia (*Available*)
   - 🟡 Dipesan (*Reserved / Pending*)
   - 🔵 Sedang Dipinjam (*Borrowed*)
   - 🔴 Rusak (*Damaged*)
   - ⚫ Pemeliharaan (*Maintenance*)

---

## 5. Pengalaman Pengguna (UX) Pada Fitur Spesifik

### a. Dashboard

*Dashboard* modern tidak hanya menampilkan angka statistik kosong. Layar utama memuat:

- *Summary cards* terpenting.
- Grafik tren peminjaman.
- Daftar barang paling sering dipinjam & aktivitas peminjaman terbaru.
- Peringatan pengembalian mendesak (*Upcoming/Late returns*).
- Garis waktu aktivitas (*Recent activities timeline*).

### b. Katalog & Detail Barang

Katalog diubah dari tabel klasik menjadi **Modern Cards**. Setiap kartu berisi foto barang, nama, kode, kategori, lencana status (*status badge*), lokasi, dan tombol Pinjam.

Di Halaman Detail Barang (*Item Detail*), sistem menyajikan: Gambar besar, spesifikasi, deskripsi, sejarah peminjaman, siapa peminjam saat ini, *QR Code* barang, dan tombol Pinjam cepat.

### c. Alur Peminjaman (Borrowing Flow)

Sistem menggunakan Alur Visual (*Visual Timeline*) yang sangat transparan bagi mahasiswa:
`Diajukan (Submitted) ➔ Disetujui (Approved) ➔ Diambil (Collected) ➔ Sedang Dipinjam (Borrowed) ➔ Dikembalikan (Returned)`

### d. Pencarian, Filter & Aksi Cepat (Quick Actions)

- Disediakan filter kuat: Berdasarkan nama, Kategori, Laboratorium, Status, Fakultas, Tanggal Pinjam/Kembali.
- Terdapat menu Aksi Cepat: *Borrow Item*, *Return Item*, *Add Item*, *Scan QR*, *Generate Report*.
- Meminimalisir jumlah klik—aksi yang sering dilakukan (*frequently used*) selalu terlihat dan mudah dijangkau tanpa perlu *dialog* atau *modal* ekstra yang tidak perlu.

---

## 6. Penanganan Status Kosong & Memuat (Empty & Loading States)

1. **Empty States:** Tabel kosong yang membosankan telah diganti dengan ilustrasi grafis bersahabat dan *call-to-action* (tombol ajakan) yang jelas.
2. **Loading Experience:** Putaran *spinner* konvensional diminimalisir; alih-alih, kami menggunakan **Skeleton Loaders** (blok abu-abu yang bersinar) untuk memberi ilusi performa yang lebih cepat saat memuat data.

---

## 7. Interaksi & Aksesibilitas (Microinteractions & Accessibility)

**Microinteractions:**

- *Hover elevation* pada kartu dan tabel.
- Transisi super halus (durasi 200–300ms) tanpa berlebihan.
- Notifikasi bergaya *Toast* untuk *feedback* sukses yang dinamis.

**Accessibility (Aksesibilitas Tinggi):**

- Mengikuti standar rasio kontras warna WCAG yang ramah mata.
- Mendukung navigasi *Keyboard* penuh (kursor/tab).
- Indikator fokus selalu terlihat (*Focus visibility*).
- Target klik tombol diperbesar (minimal 44px tinggi) untuk kemudahan operasional di *smartphone*.
- Penggunaan label khusus agar ramah bagi pembaca layar (*Screen reader-friendly*).

---
*SiPinjam Kampus dirancang sesederhana mungkin untuk staf dan mahasiswa (minim kurva pembelajaran), tetapi se-elegan produk rintisan global (world-class startup).*
