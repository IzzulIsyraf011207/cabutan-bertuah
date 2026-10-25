// Tetapan Roda Bertuah (projek Supabase "Roda Bertuah", berasingan daripada Cabutan Bertuah).
// Kunci "publishable" ini selamat diletak di laman awam: orang awam hanya boleh lihat
// nama, jantina dan kelas untuk roda (senarai_roda). Hanya admin boleh import / padam nama.
window.RODA_CONFIG = {
  SUPABASE_URL: "https://pieguphzlymuajyzpnmx.supabase.co",
  SUPABASE_KEY: "sb_publishable_O2dS2laev2L8lDIZ4f3dRA_mIWTlAFO",

  // Tukar ikut acara anda.
  NAMA_ACARA: "Roda Bertuah",
};

window.sb = window.supabase.createClient(
  window.RODA_CONFIG.SUPABASE_URL,
  window.RODA_CONFIG.SUPABASE_KEY
);

window.escapeHTML = function (s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
};

// Susun kelas secara semula jadi: "1 AMANAH" < "2 AMANAH" < "10 AMANAH".
window.bandingKelas = function (a, b) {
  return a.localeCompare(b, "ms", { numeric: true, sensitivity: "base" });
};

// Ambil semua nama untuk roda (berhalaman 1000 baris).
window.muatSemuaNama = async function () {
  const out = [];
  for (let dari = 0; ; dari += 1000) {
    const { data, error } = await sb.rpc("senarai_roda").range(dari, dari + 999);
    if (error) throw error;
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
};
