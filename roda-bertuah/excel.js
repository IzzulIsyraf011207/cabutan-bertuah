// Baca fail Excel (.xlsx / .xls / .csv) untuk Roda Bertuah. Dikongsi oleh index.html dan admin.html.
// Perlukan SheetJS (window.XLSX).
window.RodaExcel = (function () {
  const bersih = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
  const bersihKelas = (s) => bersih(s).toUpperCase();
  const TAJUK_NAMA = /^(nama|name|nama murid|nama pelajar|nama penuh|nama calon|nama peserta|student name|full name)\b/i;
  const BUKAN_NAMA = /^nama\s+(kelas|sekolah|guru|bapa|ibu|penjaga|waris)/i;
  const TAJUK_J = /^(jantina|gender|sex|j\/k|l\/p|jenis kelamin)\b/i;
  const TAJUK_K = /^(kelas|class|tingkatan|darjah|ting\.?|tahun)\b/i;

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
  const namaSah = (s) => s.length >= 2 && /[A-Za-zÀ-ɏ؀-ۿ一-鿿]/.test(s) && !TAJUK_NAMA.test(s);

  function bacaSheet(aoa, kelasLalai, sumber) {
    const out = [];
    // Cari baris tajuk dalam 20 baris pertama.
    let h = -1, cN = -1, cJ = -1, cK = -1, cL = -1, cP = -1;
    for (let i = 0; i < Math.min(aoa.length, 20) && h < 0; i++) {
      const row = (aoa[i] || []).map((x) => bersih(x));
      row.forEach((v, j) => {
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
          if (namaSah(nama)) out.push({ nama, jantina: j, kelas, sumber });
        });
      }
      return out;
    }

    // Tiada tajuk: pilih lajur yang paling banyak teks panjang sebagai nama.
    if (h < 0) {
      const skor = {};
      aoa.slice(0, 60).forEach((row) => (row || []).forEach((v, j) => {
        const s = bersih(v);
        if (namaSah(s) && s.includes(" ")) skor[j] = (skor[j] || 0) + 1;
      }));
      const terbaik = Object.entries(skor).sort((a, b) => b[1] - a[1])[0];
      if (!terbaik) return out;
      cN = Number(terbaik[0]);
      // Lajur jantina tanpa tajuk: lajur yang kebanyakannya L/P.
      const sj = {};
      aoa.slice(0, 60).forEach((row) => (row || []).forEach((v, j) => { if (j !== cN && /^(L|P)$/i.test(bersih(v))) sj[j] = (sj[j] || 0) + 1; }));
      const jb = Object.entries(sj).sort((a, b) => b[1] - a[1])[0];
      if (jb) cJ = Number(jb[0]);
    }

    for (let i = h + 1; i < aoa.length; i++) {
      const row = aoa[i] || [];
      const nama = bersih(row[cN]);
      if (!namaSah(nama)) continue;
      const kelas = cK >= 0 && bersih(row[cK]) ? bersihKelas(row[cK]) : kelasLalai;
      const jantina = (cJ >= 0 && jantinaDari(row[cJ])) || jantinaDariNama(nama);
      out.push({ nama, jantina, kelas, sumber });
    }
    return out;
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
          const rows = bacaSheet(aoa, lalai, `${f.name} › ${sn}`);
          if (!rows.length) continue;
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

  return { bersih, bersihKelas, namaPendek, namaRoda, bacaFail };
})();
