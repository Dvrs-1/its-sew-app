// Get slug from URL
const slug = window.location.pathname.split("/").pop();

const root = document.getElementById("document-root");
const heading = document.getElementById("document-heading");
const titleTag = document.getElementById("doc-title");

// Fetch document
fetch(`/api/documents/${slug}`)
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            root.innerHTML = "<p>Document not found.</p>";
            return;
        }

        // Set title + heading
        heading.textContent = data.title;
        titleTag.textContent = data.title;

        // Inject HTML content
        root.innerHTML = data.content;
    })
    .catch(err => {
        console.error("Error loading document:", err);
        root.innerHTML = "<p>Failed to load document.</p>";
    });