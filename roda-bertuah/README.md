# Roda Bertuah (nama murid)

Sistem roda bertuah **nama sahaja**, berasingan sepenuhnya daripada Cabutan Bertuah.
Data disimpan dalam projek Supabase baharu **Roda Bertuah** (`pieguphzlymuajyzpnmx`, region Singapura).

| Fail | Untuk siapa | Fungsi |
|---|---|---|
| `roda-bertuah/index.html` | Sesiapa (tanpa log masuk) | Dua roda: **👦 Lelaki** dan **👧 Perempuan**. Setiap roda mengandungi nama dari **semua kelas**, setiap kelas satu warna dan berkumpul bersebelahan. Boleh pilih **Semua Kelas** atau satu kelas sahaja. |
| `roda-bertuah/admin.html` | Admin sahaja | Import fail Excel (banyak fail sekali gus), semak sebelum simpan, senarai nama, padam, tambah satu nama, muat turun templat & eksport Excel. |
| `roda-bertuah/config.js` | — | URL & kunci publishable projek Roda Bertuah. |
| `supabase/roda-bertuah-schema.sql` | Rujukan | Skema database (sudah dipasang). |

Link (GitHub Pages):
- Roda: `https://izzulisyraf011207.github.io/cabutan-bertuah/roda-bertuah/`
- Admin: `https://izzulisyraf011207.github.io/cabutan-bertuah/roda-bertuah/admin.html`

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
