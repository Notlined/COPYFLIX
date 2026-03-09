// CONFIGURAÇÃO INTEGRADA
const cfg = {
    baseUrl: "https://api.themoviedb.org/3/",
    apiKey: "3397ebd7286392e73314a9073a477fac",
    imageBaseUrl: "https://image.tmdb.org/t/p/"
};

// --- BUSCA DE DADOS ---
async function fetchFromApi(endpoint, params = {}) {
    const url = new URL(cfg.baseUrl + endpoint);
    url.searchParams.set("api_key", cfg.apiKey);
    url.searchParams.set("language", "pt-BR");
    
    Object.entries(params).forEach(([key, value]) => {
        if (value != null) url.searchParams.set(key, value);
    });

    try {
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Erro: " + res.status);
        return await res.json();
    } catch (err) {
        console.error("[Copyflix] Erro na API:", err);
        return null;
    }
}

function getImageUrl(path, size = "w500") {
    return path ? `${cfg.imageBaseUrl}${size}${path}` : "";
}

// --- RENDERIZAR DESTAQUE (HERO) ---
let heroItems = [];
let heroIndex = 0;

function renderHero() {
    const item = heroItems[heroIndex];
    const titleEl = document.getElementById("hero-title");
    const overviewEl = document.getElementById("hero-overview");
    const backgroundEl = document.getElementById("hero-background");
    const paginationEl = document.getElementById("hero-pagination");

    if (!item || !titleEl) return;

    titleEl.textContent = item.title || item.name;
    overviewEl.textContent = item.overview ? item.overview.substring(0, 180) + "..." : "Sem sinopse.";
    
    const bgUrl = getImageUrl(item.backdrop_path || item.poster_path, "original");
    backgroundEl.style.backgroundImage = `url("${bgUrl}")`;

    // Paginação
    paginationEl.innerHTML = "";
    heroItems.forEach((_, idx) => {
        const dot = document.createElement("button");
        dot.className = "hero-dot" + (idx === heroIndex ? " active" : "");
        dot.onclick = () => { heroIndex = idx; renderHero(); };
        paginationEl.appendChild(dot);
    });
}

// --- RENDERIZAR LISTAS (ROWS) ---
function createCard(item) {
    const card = document.createElement("article");
    card.className = "card";

    const img = document.createElement("img");
    img.src = getImageUrl(item.poster_path);
    img.alt = item.title || item.name;

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = item.title || item.name;

    card.appendChild(img);
    card.appendChild(title);
    return card;
}

function renderRow(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    items.forEach(item => container.appendChild(createCard(item)));
}

// --- CARREGAMENTO INICIAL ---
async function loadData() {
    const [trending, series, movies] = await Promise.all([
        fetchFromApi("trending/all/week"),
        fetchFromApi("tv/popular"),
        fetchFromApi("movie/popular")
    ]);

    if (trending?.results) {
        heroItems = trending.results.slice(0, 5);
        renderHero();
        renderRow("row-trending", trending.results);
    }
    if (series?.results) renderRow("row-series", series.results);
    if (movies?.results) renderRow("row-movies", movies.results);
}

document.addEventListener("DOMContentLoaded", loadData);

// Timer para o Hero
setInterval(() => {
    if (heroItems.length > 0) {
        heroIndex = (heroIndex + 1) % heroItems.length;
        renderHero();
    }
}, 8000);