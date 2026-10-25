// Baca fail Excel (.xlsx / .xls / .csv) untuk Roda Bertuah. Dikongsi oleh index.html dan admin.html.
// Perlukan SheetJS (window.XLSX).
window.RodaExcel = (function () {
  const bersih = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
  const bersihKelas = (s) => bersih(s).toUpperCase();
  const TAJUK_NAMA = /^(nama|name|nama murid|nama pelajar|nama penuh|nama calon|nama peserta|student name|full name)\b/i;
  const BUKAN_NAMA = /^nama\s+(kelas|sekolah|guru|bapa|ibu|penjaga|waris|mata pelajaran|mp|subjek|subject)/i;
  const TAJUK_J = /^(jantina|gender|sex|j\/k|l\/p|jenis kelamin)\b/i;
  const TAJUK_K = /^(kelas|class|tingkatan|darjah|ting\.?|tahun)\b/i;
  const TAJUK_BUKAN = /^(mp|m\/p|mata pelajaran|subjek|subject|kod|gred|markah|jumlah|purata|catatan|alamat|no\.?\s*(kp|ic|tel)|guru|pengajar|teacher|nama guru|bapa|ibu|penjaga|waris)\b/i;

  // Perkataan yang menunjukkan sel itu BUKAN nama orang: mata pelajaran, tajuk jadual, analisis, dll.
  const BUKAN_ORANG = new RegExp("(^|[^A-Z])(" + [
    "BAHASA", "MELAYU", "INGGERIS", "ENGLISH", "MATEMATIK", "MATHEMATICS", "MATHS?", "SAINS", "SCIENCE", "SEJARAH",
    "HISTORY", "GEOGRAFI", "PENDIDIKAN", "MORAL", "JASMANI", "KESIHATAN", "VISUAL", "MUZIK", "REKA BENTUK",
    "TEKNOLOGI", "MAKLUMAT", "KOMPUTER", "FIZIK", "KIMIA", "BIOLOGI", "TAMBAHAN", "PERNIAGAAN", "PERDAGANGAN",
    "EKONOMI", "PERAKAUNAN", "PRINSIP", "KESUSASTERAAN", "LITERATURE", "SIVIK", "TASAWWUR", "SYARIAH", "AL-?QURAN",
    "HAFAZAN", "KEMAHIRAN", "KOKURIKULUM", "MATA PELAJARAN", "SUBJEK", "SUBJECT", "JUMLAH", "PURATA", "PERATUS",
    "PERATUSAN", "GRED", "MARKAH", "LULUS", "GAGAL", "CEMERLANG", "KEPUJIAN", "MINIMUM", "ANALISIS", "KEPUTUSAN",
    "BILANGAN", "KEDUDUKAN", "PENCAPAIAN", "PEPERIKSAAN", "UJIAN", "PENTAKSIRAN", "PERCUBAAN", "SEMESTER", "PENGGAL",
    "TARIKH", "DISEDIAKAN", "DISAHKAN", "TANDATANGAN", "SEKOLAH", "KEBANGSAAN", "MENENGAH", "GURU", "PENGETUA",
    "PENOLONG", "KELAS", "TINGKATAN", "TAHUN", "DARJAH", "MURID", "PELAJAR", "CALON", "LELAKI", "PEREMPUAN",
    "TOTAL", "AVERAGE", "GRADE", "PASS", "FAIL", "TIDAK HADIR", "MENGUASAI", "TAHAP", "PENGUASAAN", "BAND",
    "NAMA", "KAD PENGENALAN", "MYKID", "ALAMAT", "TELEFON", "SENARAI", "LAPORAN", "RUMUSAN", "STATISTIK", "SKOR",
    "KOD", "OPSYEN", "ELEKTIF", "TERAS",
  ].join("|") + ")(?![A-Z])");
  // Singkatan subjek biasa (BM, BI, PJK, RBT, P.ISLAM, B.MELAYU, MATE TAMB, ...)
  const SINGKATAN_SUBJEK = /^(P\.?\s?(ISLAM|I|M|MORAL)|B\.?\s?[A-Z]{1,8}|MATE?\.?\s?TAMB\.?|PJK|PJPK|PSV|PSK|RBT|TMK|ASK|SN|SJ|MT|MM|BM|BI|BA|BC|BT|PI|PM|GEO|SEJ|KH|MZ|FIZ|KIM|BIO|EKO|PP|PAKK|SRT)$/;
  const AWALAN_MELAYU = /^(MUHAMMAD|MUHAMAD|MOHAMMAD|MOHAMAD|MOHAMMED|MOHD|MUHD|MD|AHMAD|ABDUL|ABD|NUR|NURUL|NOR|NORUL|SITI|NIK|WAN|TENGKU|TUNKU|SYED|SHARIFAH|SYARIFAH|PUTERI|AWANG|DAYANG|AINUL|AIN|AINA|NURUL|NURIN|NUR)\b/;

  // Gelaran orang dewasa (guru, ibu bapa): bukan nama murid.
  const GELARAN = /^(PN|PUAN|EN|ENCIK|CIK|CIKGU|CGU|USTAZ|USTAZAH|UST|DR|DATO'?|DATIN|DATUK|TUAN|PROF|IR|HJ|HAJI|HAJAH|HJH|MR|MRS|MS|MISS|MADAM|SIR|TN|YB|YBHG)\b\.?/;

  // 0 = bukan nama orang, 1 = mungkin nama, 2 = hampir pasti nama (ada BIN/BINTI/A/L/A/P atau awalan nama)
  function jenisNama(s) {
    if (!s || s.length < 2 || s.length > 90) return 0;
    if (/\d/.test(s)) return 0;                                  // nama orang tiada nombor
    if (!/^[\p{L}\p{M}\s.'’`@\/\-,()]+$/u.test(s)) return 0;      // tiada simbol pelik (:, %, =, …)
    const u = s.toUpperCase();
    if (BUKAN_ORANG.test(u) || SINGKATAN_SUBJEK.test(u.trim()) || GELARAN.test(u)) return 0;
    const kata = u.split(/\s+/);
    if (kata.length > 8) return 0;
    if (kata.length === 1 && (u.length < 3 || (s === u && u.length <= 4))) return 0;   // singkatan pendek
    const t = ` ${u.replace(/[.,]/g, " ")} `;
    if (/\S\s+(BIN|BINTI|BINTE|BTE|BT|B|A\/L|A\/P)\s+\S/.test(t)) return 2;
    if (AWALAN_MELAYU.test(u)) return 2;
    return 1;
  }

  function jantinaDari(v) {
    const t = bersih(v).toUpperCase();
    if (!t) return "";
    if (/^(L|LELAKI|LAKI|M|MALE|BOY|LELAKI\b.*)$/.test(t)) return "L";
    if (/^(P|PEREMPUAN|F|FEMALE|GIRL|W|WANITA|PEREMPUAN\b.*)$/.test(t)) return "P";
    return "";
  }
  function jantinaDariNama(nama) {
    const t = ` ${nama.toUpperCase().replace(/[.,]/g, " ")} `;
    if (/\s(BINTI|BINTE|BTE|BT|A\/P)\s/.test(t)) return "P";
    if (/\s(BIN|B|A\/L)\s/.test(t)) return "L";
    return "";
  }
  // Sama seperti public.nama_pendek() di Supabase: buang BIN/BINTI/BT/A/L/A/P dan nama bapa.
  const namaPendek = (n) => n.replace(/\s+(BINTI|BINTE|BIN|BTE|BT\.?|B\.|B|A\s*\/\s*L|A\s*\/\s*P)(\s.*)?$/i, "").trim() || n;

  // Nilai satu lajur: berapa banyak sel yang nama orang. Lajur nama mesti kebanyakannya nama orang.
  function nilaiLajur(aoa, dari, j) {
    let isi = 0, nama = 0, kuat = 0;
    for (let i = dari; i < aoa.length; i++) {
      const v = bersih((aoa[i] || [])[j]);
      if (!v) continue;
      isi++;
      const k = jenisNama(v);
      if (k) nama++;
      if (k === 2) kuat++;
    }
    return { isi, nama, kuat, nisbah: isi ? nama / isi : 0, skor: nama + kuat * 2 };
  }
  const lajurNamaSah = (n) => n.nama >= 2 && n.nisbah >= 0.6;

  // Pulangkan { rows, sebab } — sebab diisi jika sheet diabaikan.
  function bacaSheet(aoa, kelasLalai, sumber) {
    const out = [];
    const tambah = (nama, jantina, kelas) => out.push({ nama, jantina, kelas, sumber });

    // Cari baris tajuk dalam 25 baris pertama.
    let h = -1, cN = -1, cJ = -1, cK = -1, cL = -1, cP = -1;
    const bukan = new Set();
    for (let i = 0; i < Math.min(aoa.length, 25) && h < 0; i++) {
      const row = (aoa[i] || []).map((x) => bersih(x));
      bukan.clear();
      row.forEach((v, j) => {
        if (TAJUK_BUKAN.test(v) || BUKAN_NAMA.test(v)) bukan.add(j);
        if (cN < 0 && TAJUK_NAMA.test(v) && !BUKAN_NAMA.test(v)) cN = j;
        else if (cJ < 0 && TAJUK_J.test(v)) cJ = j;
        else if (cK < 0 && TAJUK_K.test(v)) cK = j;
        if (/^(lelaki|murid lelaki|boys?)$/i.test(v)) cL = j;
        if (/^(perempuan|murid perempuan|girls?)$/i.test(v)) cP = j;
      });
      if (cN >= 0 || (cL >= 0 && cP >= 0)) h = i;
      else { cJ = cK = cL = cP = -1; }
    }

    // Format dua lajur: LELAKI | PEREMPUAN
    if (h >= 0 && cN < 0) {
      for (let i = h + 1; i < aoa.length; i++) {
        const row = aoa[i] || [];
        const kelas = cK >= 0 && bersih(row[cK]) ? bersihKelas(row[cK]) : kelasLalai;
        [[cL, "L"], [cP, "P"]].forEach(([c, j]) => {
          const nama = bersih(row[c]);
          if (jenisNama(nama)) tambah(nama, j, kelas);
        });
      }
      return { rows: out, sebab: out.length ? "" : "tiada nama murid" };
    }

    // Lajur bertajuk NAMA mesti benar-benar berisi nama orang; jika tidak, cari lajur nama terbaik.
    if (cN >= 0 && !lajurNamaSah(nilaiLajur(aoa, h + 1, cN))) cN = -1;
    if (cN < 0) {
      const lebar = Math.max(0, ...aoa.slice(0, 300).map((r) => (r || []).length));
      let terbaik = null;
      for (let j = 0; j < lebar; j++) {
        if (bukan.has(j) || j === cJ || j === cK) continue;
        const n = nilaiLajur(aoa, h + 1, j);
        if (!lajurNamaSah(n)) continue;
        if (!terbaik || n.skor > terbaik.n.skor) terbaik = { j, n };
      }
      if (!terbaik) return { rows: out, sebab: "tiada nama murid (contoh: jadual mata pelajaran / analisis)" };
      cN = terbaik.j;
      if (h < 0 && cJ < 0) {
        // Lajur jantina tanpa tajuk: lajur yang kebanyakannya L/P.
        const sj = {};
        aoa.slice(0, 300).forEach((row) => (row || []).forEach((v, j) => { if (j !== cN && /^(L|P)$/i.test(bersih(v))) sj[j] = (sj[j] || 0) + 1; }));
        const jb = Object.entries(sj).sort((a, b) => b[1] - a[1])[0];
        if (jb) cJ = Number(jb[0]);
      }
    }

    const ada = new Set();
    for (let i = h + 1; i < aoa.length; i++) {
      const row = aoa[i] || [];
      const nama = bersih(row[cN]);
      if (!jenisNama(nama)) continue;                     // sel bukan nama orang (subjek, jumlah, tajuk) diabaikan
      const kelas = cK >= 0 && bersih(row[cK]) ? bersihKelas(row[cK]) : kelasLalai;
      const kunci = `${kelas}|${nama.toUpperCase()}`;
      if (ada.has(kunci)) continue;                       // nama berulang (contoh satu baris setiap subjek)
      ada.add(kunci);
      const jantina = (cJ >= 0 && jantinaDari(row[cJ])) || jantinaDariNama(nama);
      tambah(nama, jantina, kelas);
    }
    return { rows: out, sebab: out.length ? "" : "tiada nama murid" };
  }

  async function bacaFail(files) {
    const hasil = [];
    const laporan = [];
    for (const f of files) {
      try {
        const wb = XLSX.read(await f.arrayBuffer(), { type: "array" });
        const namaFail = f.name.replace(/\.[^.]+$/, "");
        for (const sn of wb.SheetNames) {
          const aoa = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, raw: false, defval: "" });
          const lalai = /^(sheet|helaian|lembaran)\s*\d*$/i.test(sn.trim()) || wb.SheetNames.length === 1 && /^(senarai|nama|data)/i.test(sn.trim())
            ? bersihKelas(namaFail) : bersihKelas(sn);
          const { rows, sebab } = bacaSheet(aoa, lalai, `${f.name} › ${sn}`);
          if (!rows.length) {
            if (aoa.some((r) => (r || []).some((v) => bersih(v)))) laporan.push({ sumber: `${f.name} › ${sn}`, ralat: `Diabaikan — ${sebab}.` });
            continue;
          }
          hasil.push(...rows);
          laporan.push({ sumber: `${f.name} › ${sn}`, n: rows.length, tiadaJ: rows.filter((r) => !r.jantina).length,
            contoh: rows.slice(0, 3), kelas: [...new Set(rows.map((r) => r.kelas))] });
        }
      } catch (err) {
        console.error(err);
        laporan.push({ sumber: f.name, ralat: "Fail tidak dapat dibaca." });
      }
    }
    return { hasil, laporan };
  }

  // Nama yang dipapar di roda: nama pendek; jika dua murid dalam kelas & jantina yang sama
  // ada nama pendek sama, nama bapa ditambah dalam kurungan (sama seperti public.senarai_roda()).
  const namaBapa = (n) => (n.match(/\s(?:BINTI|BINTE|BIN|BTE|BT\.?|B\.|B|A\s*\/\s*L|A\s*\/\s*P)\s+(\S+)/i) || [])[1];
  function namaRoda(senarai) {
    const kira = new Map();
    const kunci = (m) => `${m.jantina}|${m.kelas}|${namaPendek(m.nama).toUpperCase()}`;
    senarai.forEach((m) => kira.set(kunci(m), (kira.get(kunci(m)) || 0) + 1));
    return senarai.map((m) => {
      const p = namaPendek(m.nama), b = namaBapa(m.nama);
      return kira.get(kunci(m)) > 1 && b ? `${p} (${b})` : p;
    });
  }

  return { bersih, bersihKelas, namaPendek, namaRoda, jenisNama, bacaFail };
})();
