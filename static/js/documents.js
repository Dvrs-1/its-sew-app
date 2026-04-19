// Get slug from URL
const slug = window.location.pathname.split("/").pop();

const root = document.getElementById("document-root");
const heading = document.getElementById("document-heading");
const titleTag = document.getElementById("doc-title");

// Fetch document
fetch(`/api/documents/${slug}`)
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    if (!data) return;

    if (heading) heading.textContent = data.title;
    if (titleTag) titleTag.textContent = data.title;

    if (root) {
      root.innerHTML = data.content;
    }
  })
  .catch(err => {
    console.error("Document load failed:", err);

    if (root) {
      root.innerHTML = "<p>Failed to load document.</p>";
    }
  });