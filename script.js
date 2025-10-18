document.addEventListener("DOMContentLoaded", () => {
  // Aktuelle Datei (Fallback auf index.html)
  const path = window.location.pathname.split("/").pop() || "index.html";

  // Alle Navigationslinks durchgehen
  document.querySelectorAll("nav .right a").forEach(a => {
    const href = a.getAttribute("href");
    if (!href || href === "#" ) return; // Platzhalter ignorieren

    // Nur den Dateinamen vergleichen; Groß/Kleinschreibung egal
    const target = href.split("/").pop();
    if (target && target.toLowerCase() === path.toLowerCase()) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
      a.removeAttribute("href"); // macht den aktiven Eintrag nicht klickbar
    }
  });
});
