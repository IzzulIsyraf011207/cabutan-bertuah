# Roda Bertuah (nama murid)

Sistem roda bertuah **nama sahaja**, berasingan sepenuhnya daripada Cabutan Bertuah.
Data disimpan dalam projek Supabase baharu **Roda Bertuah** (`pieguphzlymuajyzpnmx`, region Singapura).

| Fail | Untuk siapa | Fungsi |
|---|---|---|
| `roda-bertuah/index.html` | Sesiapa (tanpa log masuk) | Dua roda: **👦 Lelaki** dan **👧 Perempuan**. Setiap roda mengandungi nama dari **semua kelas**, setiap kelas satu warna dan berkumpul bersebelahan. Boleh pilih **Semua Kelas** atau satu kelas sahaja. |
| `roda-bertuah/admin.html` | Admin sahaja | Import fail Excel (banyak fail sekali gus), semak sebelum simpan, senarai nama, padam, tambah satu nama, muat turun templat & eksport Excel. |
| `roda-bertuah/excel.js` | — | Pembaca Excel (.xlsx/.xls/.csv) yang dikongsi oleh roda dan admin. |
| `roda-bertuah/config.js` | — | URL & kunci publishable projek Roda Bertuah. |
| `supabase/roda-bertuah-schema.sql` | Rujukan | Skema database (sudah dipasang). |

Link (GitHub Pages):
- Roda: `https://izzulisyraf011207.github.io/cabutan-bertuah/roda-bertuah/`
- Admin: `https://izzulisyraf011207.github.io/cabutan-bertuah/roda-bertuah/admin.html`

## Upload Excel terus dari roda (paling mudah)

1. Buka roda, tekan butang **Upload Excel** (kanan atas).
2. Pilih satu atau banyak fail `.xlsx` / `.xls` / `.csv`.
3. Sistem terus baca fail dan tunjuk ringkasan: bilangan lelaki & perempuan setiap kelas, dan
   contoh nama di roda (contoh `AHMAD FAIZ BIN ROSLAN → AHMAD FAIZ`).
4. Masukkan **kata laluan upload** dan tekan **Simpan & Papar di Roda**. Nama disimpan dalam
   Supabase dan terus dipapar di roda lelaki & perempuan.
   - **Upload pertama mencipta kata laluan** (sekurang-kurangnya 4 aksara). Simpan kata laluan ini;
     ia diperlukan untuk upload seterusnya supaya orang lain yang ada link tidak boleh ubah nama.
   - **Ganti semua nama lama** (ditanda secara lalai): nama lama dipadam dan diganti dengan fail baru.
     Nyahtanda untuk menambah kepada nama sedia ada.
   - **Papar sahaja di peranti ini**: terus papar di roda tanpa simpan (tanpa kata laluan).
     Hilang bila halaman dimuat semula.
5. Lupa kata laluan upload? Supabase → **Table Editor → tetapan** → padam baris
   `kata_laluan_upload`. Upload seterusnya akan mencipta kata laluan baru.

## Susunan Excel yang disyorkan

Baris pertama = tajuk lajur. Satu baris = satu murid.

| BIL | NAMA | JANTINA | KELAS |
|---|---|---|---|
| 1 | AHMAD FAIZ BIN ROSLAN | L | 5 AMANAH |
| 2 | NUR AISYAH BINTI KAMAL | P | 5 AMANAH |

- **JANTINA**: `L` / `P` (atau LELAKI / PEREMPUAN).
- Format lain yang juga diterima:
  - Tiada lajur JANTINA → diteka dari nama (BIN / A/L = lelaki, BINTI / BT / A/P = perempuan).
    Nama yang tidak dapat diteka (contoh nama Cina) akan diminta pilih L/P sebelum simpan.
  - Tiada lajur KELAS → nama **sheet** digunakan sebagai kelas (satu sheet = satu kelas).
    Jika sheet bernama "Sheet1", nama **fail** digunakan (contoh `5 AMANAH.xlsx`).
  - Dua lajur bertajuk **LELAKI** dan **PEREMPUAN** berisi nama.
- **Roda hanya papar nama pendek.** "BIN / BINTI / BT / A/L / A/P" dan nama bapa dibuang secara
  automatik, contoh `AHMAD FAIZ BIN ROSLAN` → **AHMAD FAIZ**. Jika dua murid dalam kelas & jantina
  yang sama ada nama pendek sama, nama bapa ditambah: **AHMAD (ALI)** dan **AHMAD (ABU)**.
  Nama penuh tetap disimpan (untuk teka jantina dan rujukan admin) tetapi tidak dihantar ke roda awam.
- **Hanya nama murid diambil.** Sistem analisis setiap sheet dan setiap sel: mata pelajaran
  (BAHASA MELAYU, MATEMATIK, BM, BI, PJK…), sheet analisis MP, markah, jumlah, purata, tajuk,
  "Disediakan oleh" dan nama guru (PN., EN., CIKGU, USTAZ…) diabaikan. Sheet tanpa nama murid
  ditunjuk sebagai "Diabaikan". Fail keputusan peperiksaan (satu baris setiap subjek) pun boleh:
  nama yang berulang hanya dimasukkan sekali.
- Nama kelas ditukar ke huruf besar supaya "5 Amanah" dan "5 AMANAH" dikira kelas yang sama.
- Nama yang sama dalam kelas yang sama tidak dimasukkan dua kali.

## Cipta akaun admin (sekali sahaja)

1. Supabase → projek **Roda Bertuah** → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Emel: `izzulmedia01@gmail.com` (sudah ada dalam jadual `admin`), tetapkan kata laluan, tandakan **Auto Confirm User**.
3. Admin lain: cipta user, kemudian tambah emelnya (huruf kecil) di **Table Editor → admin**.

## Cara guna semasa acara

- Buka roda, pilih **LELAKI** atau **PEREMPUAN**, tekan **MULA**, kemudian **BERHENTI**.
- Tab **Kelas**: legenda warna kelas + pilih kelas tertentu untuk cabutan dari kelas itu sahaja.
- Pemenang dipilih rawak (kriptografi) dan dikeluarkan dari roda. Senarai pemenang disimpan dalam
  pelayar peranti yang membuat cabutan. **Set semula** mengosongkan pemenang roda yang sedang dibuka sahaja.
- Nama yang diimport semasa roda dibuka akan masuk secara automatik (setiap 30 saat).
- Papan kekunci: `Space` = mula/berhenti. ⛶ = skrin penuh.

## Supaya Supabase tidak berhenti

`.github/workflows/roda-bertuah-keep-alive.yml` ping projek ini setiap 3 hari.
