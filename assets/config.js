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

// ---------------------------------------------------------------------------
// MOD DEMO (?demo=1): halaman yang sama, tetapi data contoh disimpan dalam pelayar
// sahaja. Tiada apa-apa dihantar ke database sebenar.
// ---------------------------------------------------------------------------
window.CABUTAN_DEMO = (function () {
  if (new URLSearchParams(location.search).get("demo") === "1") return true;
  try { return window.self !== window.top && !!window.parent.CABUTAN_DEMO; } catch (_) { return false; }
})();

window.DEMO_AKAUN = { emel: "demo@cabutanbertuah.my", kataLaluan: "demo1234" };

function buatKlienDemo() {
  const KEY = "cb_demo_db_v1", SESI = "cb_demo_login";
  const NAMA = ["Ahmad Faiz", "Nurul Aina", "Muhammad Haziq", "Siti Khadijah", "Amirul Hakim",
    "Farah Nabilah", "Hafiz Rahman", "Aisyah Humaira", "Zulkifli Omar", "Nur Iman", "Danish Irfan",
    "Sofea Balqis", "Ikmal Hisham", "Mardhiah Zahra", "Syafiq Aiman", "Hani Batrisyia", "Luqman Hakim",
    "Puteri Aleesya", "Arif Danial", "Qistina Maisarah", "Irfan Zikri", "Alya Damia", "Haikal Rizqi", "Nur Syifa"];
  const tunda = (v) => new Promise((r) => setTimeout(() => r(v), 180));
  const simpan = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (_) {} };
  function semai() {
    const guna = new Set(), rows = [];
    NAMA.forEach((nama, i) => {
      let no; do { no = String(1000 + Math.floor(Math.random() * 9000)); } while (guna.has(no));
      guna.add(no);
      rows.push({ id: i + 1, nombor_bertuah: no, nama,
        no_ic: "9" + String(10101 + i * 3137).padStart(5, "0") + "14" + String(1000 + i * 37).slice(-4),
        no_telefon: "01" + String(23456789 + i * 1111).slice(0, 8), alamat: null,
        created_at: new Date(Date.now() - (NAMA.length - i) * 3600e3).toISOString() });
    });
    const d = { rows, nextId: rows.length + 1 }; simpan(d); return d;
  }
  function muat() {
    try { const d = JSON.parse(localStorage.getItem(KEY) || "null"); if (d && Array.isArray(d.rows)) return d; } catch (_) {}
    return semai();
  }
  const masuk = () => { try { return sessionStorage.getItem(SESI) === "1"; } catch (_) { return false; } };

  class Q {
    constructor(jalan) { this.jalan = jalan; this.f = []; this.r = null; }
    select() { return this; }
    order() { return this; }
    range(a, b) { this.r = [a, b]; return this; }
    in(c, v) { this.f.push((x) => v.includes(x[c])); return this; }
    gt(c, v) { this.f.push((x) => x[c] > v); return this; }
    eq(c, v) { this.f.push((x) => x[c] === v); return this; }
    then(ok, gagal) { return tunda().then(() => this.jalan(this)).then(ok, gagal); }
  }
  const potong = (q, rows) => (q.r ? rows.slice(q.r[0], q.r[1] + 1) : rows);
  const ralat = (m) => ({ data: null, error: { message: m } });

  return {
    auth: {
      getSession: async () => ({ data: { session: masuk() ? { user: { email: DEMO_AKAUN.emel } } : null } }),
      signInWithPassword: async ({ email, password }) => {
        await tunda();
        if (String(email).toLowerCase() === DEMO_AKAUN.emel && password === DEMO_AKAUN.kataLaluan) {
          try { sessionStorage.setItem(SESI, "1"); } catch (_) {}
          return { error: null };
        }
        return { error: { message: "Invalid login credentials" } };
      },
      signOut: async () => { try { sessionStorage.removeItem(SESI); } catch (_) {} return { error: null }; },
    },
    from() {
      return {
        select: () => new Q((q) => {
          if (!masuk()) return ralat("permission denied");
          const rows = muat().rows.filter((x) => q.f.every((fn) => fn(x))).sort((a, b) => a.id - b.id);
          return { data: potong(q, rows).map((x) => ({ ...x })), error: null };
        }),
        delete: () => new Q((q) => {
          if (!masuk()) return ralat("permission denied");
          const d = muat(); d.rows = d.rows.filter((x) => !q.f.every((fn) => fn(x))); simpan(d);
          return { data: null, error: null };
        }),
      };
    },
    rpc(nama, a = {}) {
      return new Q((q) => {
        const d = muat();
        if (nama === "is_admin") return { data: masuk(), error: null };
        if (nama === "senarai_roda") {
          const rows = d.rows.slice().sort((x, y) => bandingNombor(x.nombor_bertuah, y.nombor_bertuah))
            .map((x) => ({ nombor_bertuah: x.nombor_bertuah, nama: x.nama }));
          return { data: potong(q, rows), error: null };
        }
        if (nama === "daftar_peserta") {
          const ic = String(a.p_no_ic || "").replace(/\D/g, "");
          const tel = String(a.p_no_telefon || "").replace(/[^\d+]/g, "");
          const nm = String(a.p_nama || "").trim().replace(/\s+/g, " ");
          if (nm.length < 2) return ralat("NAMA_TIDAK_SAH");
          if (!/^\d{12}$/.test(ic)) return ralat("IC_TIDAK_SAH");
          if (!/^\+?\d{9,14}$/.test(tel)) return ralat("TELEFON_TIDAK_SAH");
          if (d.rows.some((x) => x.no_ic === ic)) return ralat("IC_SUDAH_DAFTAR");
          const guna = new Set(d.rows.map((x) => x.nombor_bertuah));
          let no; do { no = String(1000 + Math.floor(Math.random() * 9000)); } while (guna.has(no));
          const row = { id: d.nextId++, nombor_bertuah: no, nama: nm, no_ic: ic, no_telefon: tel, alamat: null, created_at: new Date().toISOString() };
          d.rows.push(row); simpan(d);
          return { data: [{ nombor_bertuah: no, nama: nm, created_at: row.created_at }], error: null };
        }
        return ralat("Fungsi tidak disokong dalam demo");
      });
    },
    _setSemula() { try { localStorage.removeItem(KEY); localStorage.removeItem("cabutan_bertuah_pemenang_v1_demo"); localStorage.removeItem("cabutan_bertuah_saya_demo"); } catch (_) {} },
  };
}

window.sb = window.CABUTAN_DEMO
  ? buatKlienDemo()
  : window.supabase.createClient(window.CABUTAN_CONFIG.SUPABASE_URL, window.CABUTAN_CONFIG.SUPABASE_KEY);

// Kunci simpanan pelayar diasingkan untuk demo.
window.kunciSimpan = (k) => (window.CABUTAN_DEMO ? k + "_demo" : k);

if (window.CABUTAN_DEMO) {
  document.addEventListener("DOMContentLoaded", () => {
    // Kekalkan mod demo bila pindah halaman.
    document.querySelectorAll('a[href$=".html"]').forEach((a) => {
      a.href = a.getAttribute("href") + (a.getAttribute("href").includes("?") ? "&" : "?") + "demo=1";
    });
    // Akaun demo diisi terus pada halaman log masuk admin.
    const em = document.getElementById("email"), pw = document.getElementById("kataLaluan");
    if (em && pw) {
      em.value = DEMO_AKAUN.emel; pw.value = DEMO_AKAUN.kataLaluan;
      const n = document.createElement("div");
      n.className = "demo-nota";
      n.innerHTML = "Akaun demo sudah diisi:<br><b>" + DEMO_AKAUN.emel + "</b> / <b>" + DEMO_AKAUN.kataLaluan + "</b><br>Tekan <b>Log Masuk</b>.";
      em.closest("form").insertBefore(n, em.closest(".field"));
    }
    if (window.self !== window.top) return;   // dalam Pusingan Bertuah: jalur demo sudah ada di halaman induk
    const bar = document.createElement("div");
    bar.className = "demo-bar";
    bar.innerHTML = '<span class="demo-tag">MOD DEMO</span><span class="demo-teks">Data contoh sahaja, tidak disimpan.</span>' +
      '<button type="button" class="demo-reset">Set semula</button>' +
      '<a class="demo-beli" href="produk/#beli">Dapatkan Sistem Saya →</a>';
    document.body.prepend(bar);
    bar.querySelector(".demo-reset").onclick = () => { sb._setSemula(); location.reload(); };
    const st = document.createElement("style");
    st.textContent = `
      .demo-bar{position:relative;z-index:60;display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center;
        padding:8px 12px;background:linear-gradient(90deg,#7c3aed,#a21caf 55%,#db2777);color:#fff;font:600 13px/1.3 'Plus Jakarta Sans',system-ui,sans-serif;text-align:center}
      .demo-tag{background:#ffd56b;color:#3a2700;font-weight:800;letter-spacing:.08em;padding:3px 8px;border-radius:999px;font-size:11px}
      .demo-reset{border:1px solid rgba(255,255,255,.5);background:none;color:#fff;border-radius:999px;padding:4px 10px;font:inherit;cursor:pointer}
      .demo-beli{background:#fff;color:#7c3aed;font-weight:800;text-decoration:none;border-radius:999px;padding:5px 12px}
      .demo-nota{margin:0 0 16px;padding:12px 14px;border-radius:12px;background:#f3e8ff;color:#5b21b6;font-size:14px;line-height:1.5}
      @media (max-width:520px){.demo-teks{display:none}}`;
    document.head.appendChild(st);
  });
}

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
