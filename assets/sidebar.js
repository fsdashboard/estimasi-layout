(function () {
  "use strict";

  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("sidebarToggle");
  const overlay = document.getElementById("overlay");

  if (!sidebar || !toggle) return;

  const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

  function setCollapsed(collapsed) {
    sidebar.classList.toggle("collapsed", collapsed);

    if (overlay) {
      overlay.classList.toggle("active", isMobile() && !collapsed);
    }

    toggle.setAttribute("aria-expanded", String(!collapsed));
  }

  function toggleSidebar() {
    setCollapsed(!sidebar.classList.contains("collapsed"));
  }

  toggle.addEventListener("click", toggleSidebar);

  if (overlay) {
    overlay.addEventListener("click", () => setCollapsed(true));
  }

  document.querySelectorAll(".app-nav-item").forEach((link) => {
    link.addEventListener("click", () => {
      if (isMobile()) setCollapsed(true);
    });
  });

  window.addEventListener("resize", () => {
    if (!isMobile() && overlay) {
      overlay.classList.remove("active");
    }
  });

  setCollapsed(isMobile());
})();