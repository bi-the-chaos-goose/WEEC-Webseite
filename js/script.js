document.addEventListener("DOMContentLoaded", () => {
  // aktuelle Datei (z. B. "aboutUs.html" oder "index.html")
  let currentPath = window.location.pathname;
  if (currentPath.endsWith("/")) currentPath += "index.html";
  const currentFile = currentPath.split("/").pop().toLowerCase();

  document.querySelectorAll("nav .right a").forEach(a => {
    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    // absolute URL auflösen (damit ../ funktioniert)
    const url = new URL(href, window.location.href);
    let targetPath = url.pathname;
    if (targetPath.endsWith("/")) targetPath += "index.html";
    const targetFile = targetPath.split("/").pop().toLowerCase();

    if (targetFile === currentFile) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
      a.removeAttribute("href"); // macht Link nicht klickbar
    }
  });
});
