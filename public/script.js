const figureGrid = document.getElementById("figureGrid");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const sortSelect = document.getElementById("sortSelect");

const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const emptyState = document.getElementById("emptyState");

const figureDialog = document.getElementById("figureDialog");
const figureForm = document.getElementById("figureForm");
const formError = document.getElementById("formError");
const saveFigureButton = document.getElementById("saveFigureButton");

let figures = [];
let wishlistOnly = false;

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

function showElement(element, visible) {
  element.classList.toggle("hidden", !visible);
}

function updateStatistics() {
  const owned = figures.filter((figure) => figure.status === "Owned").length;
  const ordered = figures.filter((figure) => figure.status === "Ordered").length;
  const wished = figures.filter((figure) => figure.status === "Wished").length;

  document.getElementById("ownedCount").textContent = owned;
  document.getElementById("orderedCount").textContent = ordered;
  document.getElementById("wishedCount").textContent = wished;
  document.getElementById("totalCount").textContent = figures.length;
}

function getStatusClass(status) {
  return String(status || "Wished").toLowerCase();
}

function isValidImageURL(value) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function createFigureCard(figure) {
  const status = ["Owned", "Ordered", "Wished"].includes(figure.status)
    ? figure.status
    : "Wished";

  const imageURL = isValidImageURL(figure.image_url)
    ? escapeHTML(figure.image_url)
    : "";

  const imageContent = imageURL
    ? `<img class="figure-image"
         src="${imageURL}"
         alt="${escapeHTML(figure.name)}"
         loading="lazy">`
    : `<div class="image-placeholder" aria-label="No figure image">✿</div>`;

  const releaseDate = figure.release_date
    ? escapeHTML(String(figure.release_date).slice(0, 10))
    : "Not specified";

  const statusClass = getStatusClass(status);
  const selectId = `figure-status-${escapeHTML(figure.id)}`;

  return `
    <article class="figure-card">
      <div class="figure-image-wrap">
        ${imageContent}
        <span class="status-badge ${statusClass}">
          ${escapeHTML(status)}
        </span>
      </div>

      <div class="figure-info">
        <h3>${escapeHTML(figure.name)}</h3>

        <p class="figure-series">
          ${escapeHTML(figure.series || "Series not specified")}
        </p>

        <dl class="figure-meta">
          <div>
            <dt>♡</dt>
            <dd>${escapeHTML(figure.character_name || "Character not specified")}</dd>
          </div>
          <div>
            <dt>✧</dt>
            <dd>${escapeHTML(figure.manufacturer || "Manufacturer not specified")}</dd>
          </div>
          <div>
            <dt>◇</dt>
            <dd>${escapeHTML(figure.scale || "Scale not specified")}</dd>
          </div>
          <div>
            <dt>▦</dt>
            <dd>${releaseDate}</dd>
          </div>
        </dl>

        <div class="card-bottom">
          <span class="card-id">FIGURE #${escapeHTML(figure.id)}</span>
          <span class="card-status">${escapeHTML(status)} collection</span>
        </div>

        <div class="figure-status-control">
          <label class="status-control-label" for="${selectId}">
            Collection status
          </label>

          <div class="status-select-wrap">
            <span class="status-current-dot ${statusClass}"></span>

            <select
              id="${selectId}"
              class="figure-status-select"
              data-figure-id="${escapeHTML(figure.id)}"
              aria-label="Change collection status for ${escapeHTML(figure.name)}"
            >
              <option value="Owned" ${status === "Owned" ? "selected" : ""}>Owned</option>
              <option value="Ordered" ${status === "Ordered" ? "selected" : ""}>Ordered</option>
              <option value="Wished" ${status === "Wished" ? "selected" : ""}>Wished</option>
            </select>
          </div>
        </div>
      </div>
    </article>
  `;
}

function getFilteredFigures() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;
  const sort = sortSelect.value;

  const filtered = figures.filter((figure) => {
    const searchableText = [
      figure.name,
      figure.series,
      figure.character_name,
      figure.manufacturer,
      figure.scale
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(query);

    const matchesStatus =
      selectedStatus === "All" || figure.status === selectedStatus;

    const matchesWishlist = !wishlistOnly || figure.status === "Wished";

    return matchesSearch && matchesStatus && matchesWishlist;
  });

  filtered.sort((a, b) => {
    if (sort === "name") {
      return String(a.name || "").localeCompare(String(b.name || ""));
    }

    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

    if (sort === "oldest") {
      return dateA - dateB || Number(a.id) - Number(b.id);
    }

    return dateB - dateA || Number(b.id) - Number(a.id);
  });

  return filtered;
}

function renderFigures() {
  const filteredFigures = getFilteredFigures();

  figureGrid.innerHTML = filteredFigures.map(createFigureCard).join("");

  document.getElementById("resultCount").textContent = `${
    filteredFigures.length
  } ${filteredFigures.length === 1 ? "figure" : "figures"}`;

  showElement(loadingState, false);
  showElement(errorState, false);
  showElement(emptyState, filteredFigures.length === 0);

  if (figures.length > 0 && filteredFigures.length === 0) {
    emptyState.querySelector("h3").textContent = "No figures found";
    emptyState.querySelector("p").textContent =
      "Try a different search or change your filters.";
    document.getElementById("emptyAddFigure").classList.add("hidden");
  } else {
    emptyState.querySelector("h3").textContent = "Your shelf is waiting!";
    emptyState.querySelector("p").textContent =
      "No figures found here just yet. Your next favorite could be the first.";
    document.getElementById("emptyAddFigure").classList.remove("hidden");
  }
}

async function loadFigures() {
  showElement(loadingState, true);
  showElement(errorState, false);
  showElement(emptyState, false);
  figureGrid.innerHTML = "";

  try {
    const response = await fetch("/api/figures");

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("The figures API did not return a list.");
    }

    figures = data.map((figure) => ({
      ...figure,
      status: ["Owned", "Ordered", "Wished"].includes(figure.status)
        ? figure.status
        : "Wished"
    }));

    updateStatistics();
    renderFigures();
  } catch (error) {
    console.error("Could not load figures:", error);
    showElement(loadingState, false);
    showElement(errorState, true);
  }
}

function openFigureDialog() {
  formError.textContent = "";
  showElement(formError, false);
  figureDialog.showModal();
}

function closeFigureDialog() {
  figureDialog.close();
}

document
  .getElementById("openAddFigure")
  .addEventListener("click", openFigureDialog);
document
  .getElementById("heroAddFigure")
  .addEventListener("click", openFigureDialog);
document
  .getElementById("emptyAddFigure")
  .addEventListener("click", openFigureDialog);

document
  .getElementById("closeFigureDialog")
  .addEventListener("click", closeFigureDialog);
document
  .getElementById("cancelFigure")
  .addEventListener("click", closeFigureDialog);

document.getElementById("retryButton").addEventListener("click", loadFigures);

searchInput.addEventListener("input", renderFigures);
statusFilter.addEventListener("change", renderFigures);
sortSelect.addEventListener("change", renderFigures);

document.getElementById("wishlistNav").addEventListener("click", (event) => {
  event.preventDefault();

  wishlistOnly = !wishlistOnly;
  statusFilter.value = wishlistOnly ? "Wished" : "All";

  document
    .getElementById("wishlistNav")
    .classList.toggle("active", wishlistOnly);
  document.getElementById("collectionHeading").textContent = wishlistOnly
    ? "Your wishlist"
    : "Your collection";

  renderFigures();
  document
    .getElementById("collection")
    .scrollIntoView({ behavior: "smooth" });
});

figureGrid.addEventListener("change", async (event) => {
  const statusSelect = event.target.closest(".figure-status-select");
  if (!statusSelect) return;

  const figureId = Number(statusSelect.dataset.figureId);
  const figure = figures.find((item) => Number(item.id) === figureId);
  if (!figure) return;

  const previousStatus = figure.status;
  const newStatus = statusSelect.value;
  statusSelect.disabled = true;

  try {
    const response = await fetch(`/api/figures/${figureId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || "Could not update status.");
    }

    figure.status = newStatus;
    updateStatistics();
    renderFigures();
  } catch (error) {
    alert(error.message);
    figure.status = previousStatus;
    await loadFigures();
  }
});

figureForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  formError.textContent = "";
  showElement(formError, false);
  saveFigureButton.disabled = true;
  saveFigureButton.textContent = "Saving...";

  const formData = new FormData(figureForm);

  const payload = {
    name: formData.get("name").trim(),
    series: formData.get("series").trim() || null,
    character_name: formData.get("character_name").trim() || null,
    manufacturer: formData.get("manufacturer").trim() || null,
    scale: formData.get("scale").trim() || null,
    release_date: formData.get("release_date") || null,
    image_url: formData.get("image_url").trim() || null,
    status: formData.get("status")
  };

  try {
    const response = await fetch("/api/figures", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || "Could not save this figure.");
    }

    figureForm.reset();
    closeFigureDialog();

    wishlistOnly = false;
    statusFilter.value = "All";
    document.getElementById("wishlistNav").classList.remove("active");
    document.getElementById("collectionHeading").textContent =
      "Your collection";

    await loadFigures();
  } catch (error) {
    formError.textContent = error.message;
    showElement(formError, true);
  } finally {
    saveFigureButton.disabled = false;
    saveFigureButton.textContent = "Save figure";
  }
});

loadFigures();