// Tetapan Cabutan Bertuah. Kunci "publishable" ini selamat diletak di laman awam:
// orang awam hanya boleh daftar (daftar_peserta) dan lihat nombor + nama untuk roda
// (senarai_roda). IC, telefon dan alamat hanya boleh dilihat oleh admin.
window.CABUTAN_CONFIG = {
  SUPABASE_URL: "https://scxpyfvdhcjalsedasel.supabase.co",
  SUPABASE_KEY: "sb_publishable_dOMhL_JnSurmr3nDrvfG9Q_Pgelo6yf",

  // Tukar ikut acara anda.
  NAMA_ACARA: "Cabutan Bertuah",
  KETERANGAN: "Isi borang di bawah untuk mendapatkan nombor bertuah anda.",
};

window.sb = window.supabase.createClient(
  window.CABUTAN_CONFIG.SUPABASE_URL,
  window.CABUTAN_CONFIG.SUPABASE_KEY
);

window.formatIC = function (ic) {
  const d = String(ic || "").replace(/\D/g, "");
  return d.length === 12 ? `${d.slice(0, 6)}-${d.slice(6, 8)}-${d.slice(8)}` : d;
};

window.escapeHTML = function (s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
};

// Senarai nombor ikut urutan nombor sebenar (4 digit dulu, kemudian 5 digit).
window.bandingNombor = function (a, b) {
  return a.length - b.length || a.localeCompare(b);
};
