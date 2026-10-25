# Cabutan Bertuah

Borang digital cabutan bertuah + panel admin + roda cabutan. Data disimpan dalam
Supabase (projek **Cabutan Bertuah**, `scxpyfvdhcjalsedasel`, region Singapura).

| Fail | Untuk siapa | Fungsi |
|---|---|---|
| `index.html` | Orang awam | Borang (nama, IC, telefon, alamat). Lepas **Simpan**, pop up keluar nombor bertuah + nota "Sila screenshot atau simpan nombor ini untuk cabutan bertuah." Ada butang simpan gambar nombor. |
| `admin.html` | Admin sahaja | Log masuk, senarai semua peserta, cari, **cetak senarai penuh**, **cetak nombor sahaja**, muat turun Excel (CSV), **padam peserta** (pilih satu-satu atau padam semua). |
| `cabutan.html` | Sesiapa (tanpa log masuk) | Roda cabutan bertuah. Tekan **MULA**, roda berhenti sendiri (atau tekan **BERHENTI**). Ada bunyi tik semasa berpusing. Pemenang dipilih rawak dan tidak berulang. |
| `supabase/schema.sql` | Rujukan | Skema database (sudah dipasang di Supabase). |

## 1. Cipta akaun admin (sekali sahaja)

1. Buka Supabase → projek **Cabutan Bertuah** → **Authentication** → **Users**.
2. Tekan **Add user** → **Create new user**.
3. Masukkan emel admin (emel yang sudah ada dalam jadual `admin`), tetapkan kata laluan,
   tandakan **Auto Confirm User**.
4. Siap.

Nak tambah admin lain? Cipta user seperti di atas, kemudian di **Table Editor → admin**
tambah baris dengan emel tersebut (huruf kecil).

## 2. Letak laman web online (percuma)

**GitHub Pages** (repo public):

1. Di GitHub, buka repo ini → **Settings** → **Pages**.
2. Bawah **Build and deployment**: Source = **Deploy from a branch**, Branch = `main`, folder `/ (root)` → **Save**.
3. Tunggu 1–2 minit. Link: `https://<username>.github.io/cabutan-bertuah/`
   - Admin: `…/cabutan-bertuah/admin.html`
   - Roda cabutan: `…/cabutan-bertuah/cabutan.html`

Atau **Netlify Drop**:

1. Buka https://app.netlify.com/drop
2. Seret (drag) folder projek ini ke dalam halaman itu.
3. Netlify beri link, contohnya `https://nama-rawak.netlify.app`.
   - Borang awam: `https://…netlify.app/`
   - Admin: `https://…netlify.app/admin.html`
   - Roda cabutan: `https://…netlify.app/cabutan.html`
4. (Pilihan) Daftar akaun Netlify percuma supaya link kekal dan boleh tukar nama.

Boleh juga guna Vercel, Cloudflare Pages atau mana-mana hosting fail statik.

## 3. Cara guna semasa acara

- Kongsi link borang (atau buat QR code) kepada orang ramai.
- **Tiada had bilangan peserta.** Setiap No. IC hanya boleh daftar **sekali**. Nombor bertuah
  dijana secara rawak di server dan unik: bermula 4 digit, dan bertambah digit secara automatik
  bila peserta makin ramai (5 digit selepas ~5,400 peserta, 6 digit selepas ~54,000, dan seterusnya).
- Hari cabutan: buka `cabutan.html` terus, tiada log masuk.
  Tekan ⛶ untuk skrin penuh (sesuai untuk projektor/TV).
  1. Tekan **MULA** (atau butang tengah roda). Roda berpusing dengan bunyi tik.
  2. Roda **berhenti sendiri** dalam beberapa saat. Nak hentikan lebih awal? Tekan **BERHENTI**.
  3. Nombor dan nama pemenang dipaparkan. Tekan **Teruskan Cabutan** untuk pusingan seterusnya.
- Pemenang dipilih secara rawak (kriptografi) dan **dikeluarkan dari roda**, jadi
  nombor yang sama tidak akan menang dua kali.
- Senarai pemenang disimpan dalam pelayar peranti yang membuat cabutan (kekal walaupun
  halaman dimuat semula). **Set semula** mengosongkannya.
- Peserta baru yang daftar semasa acara akan masuk ke roda secara automatik (setiap 15 saat).
- Papan kekunci: `Space` = mula/berhenti.

## Supaya Supabase tidak berhenti (plan percuma)

Supabase menghentikan projek percuma selepas 7 hari tiada aktiviti. Repo ini ada
GitHub Actions `.github/workflows/supabase-keep-alive.yml` yang ping database setiap
3 hari secara automatik, jadi projek kekal aktif tanpa perlu dibuka.

- Semak di tab **Actions** repo: setiap larian patut bertanda ✅.
- GitHub mematikan jadual automatik jika repo tiada sebarang commit selama 60 hari.
  GitHub akan hantar emel amaran. Tekan **Enable workflow** di tab Actions (atau buat
  apa-apa commit) untuk sambung semula.
- Jika projek tetap dihentikan: buka dashboard Supabase → projek **Cabutan Bertuah** →
  **Restore project**. Data tidak hilang.
- Cara paling pasti: naik taraf projek ke plan Pro (projek tidak akan dihentikan).

## Cetak dari Supabase terus

Selain butang cetak di `admin.html`, dalam Supabase buka **Table Editor → senarai_cetak**
(atau SQL Editor: `select * from senarai_cetak;`) dan tekan **Export → CSV** untuk buka
dalam Excel dan cetak.

## Keselamatan

- Orang awam hanya boleh mendaftar (`daftar_peserta`) dan melihat **nombor + nama** untuk roda
  (`senarai_roda`). IC, telefon dan alamat hanya boleh dilihat oleh admin.
- Hanya akaun yang emelnya ada dalam jadual `admin` boleh melihat senarai penuh dan mencetak.
- Kunci dalam `assets/config.js` ialah kunci *publishable* dan selamat diletak di laman awam.
  **Jangan sekali-kali** letak kunci `service_role` / secret dalam fail ini.

## Tukar nama acara

Edit `assets/config.js`:

```js
NAMA_ACARA: "Cabutan Bertuah",
KETERANGAN: "Isi borang di bawah untuk mendapatkan nombor bertuah anda.",
```
