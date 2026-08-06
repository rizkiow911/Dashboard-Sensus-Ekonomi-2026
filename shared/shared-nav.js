/* =====================================================================
   SHARED-NAV.JS
   Merender header + navigasi menu yang sama di semua halaman.
   Menu yang belum dibangun (built:false di shared-config.js) otomatis
   ditampilkan dengan badge "Segera hadir" dan tidak bisa diklik —
   sehingga dashboard tetap terlihat utuh walau baru sebagian menu jadi.
   ===================================================================== */
(function () {
  function renderNav() {
    const mount = document.getElementById("appHeader");
    if (!mount) return;

    const cfg = window.APP_CONFIG || {};
    const menu = cfg.menuStatus || {};
    const currentPage = document.body.getAttribute("data-page") || "";

    const menuKeys = Object.keys(menu);
    const items = menuKeys.length
      ? menuKeys.map(key => {
          const m = menu[key];
          const isActive = key === currentPage;
          const cls = ["nav-item"];
          if (isActive) cls.push("is-active");
          if (!m.built) cls.push("is-soon");

          if (m.built) {
            return `<a class="${cls.join(" ")}" href="${m.href}">${m.label}</a>`;
          }
          return `<span class="${cls.join(" ")}" title="Menu ini sedang dibangun">${m.label}<i>Segera hadir</i></span>`;
        }).join("")
      : `<span class="nav-item" style="color:#BC4B2C;">⚠ Menu tidak bisa ditampilkan — shared-config.js tidak termuat/tidak valid.</span>`;

    mount.innerHTML = `
      <div class="header-bar">
        <div class="brand">
          <span class="brand-eyebrow">SE2026 &middot; Jakarta Timur</span>
          <span class="brand-title">Dashboard Pemantauan Sensus Ekonomi</span>
        </div>
        <div id="syncBadge" class="sync-badge">
          <span class="dot"></span> Memuat data&hellip;
        </div>
      </div>
      <nav class="main-nav">${items}</nav>
    `;
  }

  document.addEventListener("DOMContentLoaded", renderNav);
  window.setSyncBadge = function (text, state) {
    const el = document.getElementById("syncBadge");
    if (!el) return;
    el.innerHTML = `<span class="dot ${state || ''}"></span> ${text}`;
  };
})();
