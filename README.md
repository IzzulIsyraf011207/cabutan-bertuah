# Cabutan Bertuah

Borang digital cabutan bertuah + panel admin + roda cabutan. Data disimpan dalam
Supabase (projek **Cabutan Bertuah**, `scxpyfvdhcjalsedasel`, region Singapura).

| Fail | Untuk siapa | Fungsi |
|---|---|---|
| `index.html` | Orang awam | Borang (nama, IC, telefon, alamat). Lepas **Simpan**, pop up keluar nombor bertuah + nota "Sila screenshot atau simpan nombor ini untuk cabutan bertuah." Ada butang simpan gambar nombor. |
| `admin.html` | Admin sahaja | Log masuk, senarai semua peserta, cari, **cetak senarai penuh**, **cetak nombor sahaja**, muat turun Excel (CSV). |
| `cabutan.html` | Admin sahaja | Roda cabutan bertuah dengan butang **MULA** dan **CABUT**. Pemenang dipaparkan dalam pop up dan disimpan ke database. |
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
- Setiap No. IC hanya boleh daftar **sekali**. Nombor bertuah dijana secara rawak
  di server (4 digit, unik).
- Hari cabutan: buka `admin.html` → log masuk → **Buka Paparan Cabutan**.
  Tekan ⛶ untuk skrin penuh (sesuai untuk projektor/TV).
  1. Tulis nama hadiah (pilihan).
  2. Tekan **MULA** → roda berpusing.
  3. Tekan **CABUT** → roda perlahan dan berhenti pada nombor pemenang.
  4. Tekan **Sahkan & Simpan Pemenang** (atau **Cabut Semula** jika pemenang tiada di tempat).
- Pemenang yang disahkan dikeluarkan dari bulatan untuk cabutan seterusnya
  (boleh matikan "Kecualikan pemenang terdahulu").
- Papan kekunci: `Space` = mula/cabut.

## Cetak dari Supabase terus

Selain butang cetak di `admin.html`, dalam Supabase buka **Table Editor → senarai_cetak**
(atau SQL Editor: `select * from senarai_cetak;`) dan tekan **Export → CSV** untuk buka
dalam Excel dan cetak.

## Keselamatan

- Orang awam **tidak boleh** membaca senarai peserta. Mereka hanya boleh mendaftar
  melalui fungsi `daftar_peserta`.
- Hanya akaun yang emelnya ada dalam jadual `admin` boleh melihat, mencetak dan
  membuat cabutan.
- Kunci dalam `assets/config.js` ialah kunci *publishable* dan selamat diletak di laman awam.
  **Jangan sekali-kali** letak kunci `service_role` / secret dalam fail ini.

## Tukar nama acara

Edit `assets/config.js`:

```js
NAMA_ACARA: "Cabutan Bertuah",
KETERANGAN: "Isi borang di bawah untuk mendapatkan nombor bertuah anda.",
```
