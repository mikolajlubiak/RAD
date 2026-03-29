export function renderIndex() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Ostrołęcki System Monitorowania Radiacyjnego</title>
<link rel="icon" type="image/png" href="https://icmt.cc/p/rad-the-local-radiaton-website/favicon_hu_dc0b661d74b90e4d.png" />
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
  :root {
    --bg: #0f1117;
    --card: #1b1f2a;
    --accent: #2563eb;
    --warn: #ff4f4f;
    --text: #e6e6e6;
    --muted: #888;
  }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    margin: 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
  }
  h1 {
    font-weight: 600;
    font-size: 1.8rem;
    margin-bottom: 0.3em;
    color: var(--accent);
  }
  .offline {
    background: var(--warn);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    animation: blink 1.5s infinite alternate;
  }
  @keyframes blink {
    from { opacity: 0.6; }
    to { opacity: 1; }
  }
  .card {
    background: var(--card);
    border-radius: 16px;
    padding: 1.5rem 2rem;
    box-shadow: 0 0 15px rgba(0,0,0,0.4);
    margin-bottom: 1.5rem;
    width: 90%;
    max-width: 700px;
    text-align: left;
  }
  .card-center {
    text-align: center;
  }
  
  #instant {
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--accent);
    text-shadow: 0 0 15px rgba(37,99,235,0.4);
  }
  .meta {
    color: var(--muted);
    margin-top: 0.3rem;
  }
  #notifToggle {
    position: fixed;
    top: 1rem;
    left: 1rem;
    background: var(--card);
    color: var(--accent);
    border: 1px solid var(--accent);
    border-radius: 8px;
    padding: 0.4rem 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 100;
  }
  #notifToggle:hover {
    background: var(--accent);
    color: var(--bg);
  }
  select {
    background: var(--card);
    color: var(--text);
    border: 1px solid var(--accent);
    border-radius: 8px;
    padding: 0.4rem 0.6rem;
    margin-top: 0.8rem;
  }
  canvas {
    width: 100%;
    max-width: 700px;
    height: 300px;
  }
  footer {
    margin-top: 1rem;
    font-size: 0.8rem;
    color: var(--muted);
  }
  footer a {
    color: var(--accent);
    text-decoration: none;
  }
  footer a:hover {
    text-decoration: underline;
  }
  /* About/Info Sections */
  h2 {
    font-size: 1.3rem;
    color: var(--text);
    border-bottom: 2px solid var(--accent);
    padding-bottom: 0.3rem;
    margin-top: 0;
    display: inline-block;
  }
  .info-text {
    font-size: 0.95rem;
    line-height: 1.6;
    color: #ccc;
  }
  .info-text strong {
    color: var(--text);
  }
  .benefits-list {
    margin-top: 0.5rem;
    padding-left: 1.2rem;
  }
  .benefits-list li {
    margin-bottom: 0.4rem;
  }
  .disclaimer {
    font-size: 0.85rem;
    color: var(--muted);
    border-top: 1px solid #333;
    padding-top: 1rem;
    margin-top: 1rem;
  }
  .partner-box {
    border: 2px dashed #444;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    color: #888;
    margin-top: 1rem;
    background: rgba(255,255,255,0.02);
  }
</style>
</head>
<body>

<button id="langToggle" style="position:fixed; top:1rem; right:1rem; background-color:#333; color:white; border:none; padding:0.5rem 1rem; border-radius:0.25rem; cursor:pointer; z-index:100;">
  🌐
</button>

<button id="notifToggle" data-i18n="notifyOff">Notify: Off</button>
<h1 id="mainTitle">Ostrołęcki System Monitorowania Radiacyjnego</h1>
<div id="offline" style="display:none;" class="offline"></div>

<div class="card card-center">
  <div id="instant">-- µSv/h</div>
  <div class="meta"><span data-i18n="avgLabel">Średnia:</span> <span id="avg">--</span> µSv/h | CPM: <span id="cpm">--</span></div>
</div>

<div class="card card-center" style="font-size:0.9rem; margin-top:0.5rem;">
  <span style="color:#00c9a7;">■ <span data-i18n="safe">Bezpiecznie</span> 0–0.3 µSv/h</span>
  <span style="color:#ffeb3b; margin-left:0.8rem;">■ <span data-i18n="caution">Uwaga</span> 0.3–1 µSv/h</span>
  <span style="color:#ff9800; margin-left:0.8rem;">■ <span data-i18n="high">Wysokie</span> 1–5 µSv/h</span>
  <span style="color:#ff4f4f; margin-left:0.8rem;">■ <span data-i18n="danger">Niebezpieczeństwo</span> >5 µSv/h</span>
</div>

<div class="card card-center">
  <canvas id="chart"></canvas>
  <select id="range">
  <option value="1hr" selected data-i18n="range1h">Ostatnia 1 godzina</option>
  <option value="10hr" data-i18n="range10h">Ostatnie 10 godzin</option>
  <option value="10day" data-i18n="range10d">Ostatnie 10 dni</option>
  <option value="50day" data-i18n="range50d">Ostatnie 50 dni</option>
</select>
</div>

<!-- O PROJEKCIE / DLA MIASTA -->
<div class="card info-text" style="margin-top:2rem;">
  <h2>O projekcie</h2>
  <p><strong>Ostrołęcki System Monitorowania Radiacyjnego</strong> to niezależna i w pełni funkcjonalna stacja pomiarowa działająca w Ostrołęce <strong>nieprzerwanie od ponad 3 lat</strong>. Jej celem jest całodobowe dostarczanie otwartych danych o poziomie promieniowania jonizującego w naszym mieście.</p>
  
  <p>Projekt tworzą dwaj młodzi mieszkańcy Ostrołęki:</p>
  <ul>
    <li><strong>Mikołaj Lubiak (19 lat)</strong> – Senior Software Engineer i specjalista ds. cyberbezpieczeństwa, prowadzący własną działalność gospodarczą. Odpowiada za infrastrukturę chmurową, back-end i interfejs systemu.</li>
    <li><strong>Norbert Domian (18 lat)</strong> – Freelancer i specjalista ds. sprzętu, systemów embedded i IoT. Odpowiada za konstrukcję stacji, integrację czujników i komunikację mikrokontrolerów.</li>
  </ul>

  <h2 style="margin-top: 1rem;">Korzyści dla Miasta (Smart City)</h2>
  <p>Gotowa infrastruktura systemu to szansa na innowację prospołeczną bez kosztów opracowywania technologii od zera. Wsparcie i wdrożenie systemu zapewnia miastu:</p>
  <ul class="benefits-list">
    <li><strong>Nowoczesny wizerunek</strong> na miarę idei "Smart City" oraz pionierstwo technologiczne wśród miast podobnej wielkości.</li>
    <li><strong>Zwiększone bezpieczeństwo i świadomość</strong> mieszkańców poprzez darmowy wgląd w lokalne środowisko radiacyjne.</li>
    <li><strong>Wartość edukacyjną:</strong> Dostępność danych pozwoli lokalnym szkołom (licea, technika) na prowadzenie analiz matematycznych, geograficznych czy fizycznych na bazie informacji zebranych na obszarze Ostrołęki.</li>
    <li><strong>Skalowalność i integrację:</strong> System można zintegrować z obecnymi stacjami jakości powietrza i czujnikami pogodowymi, tworząc jednolity węzeł informacji środowiskowej.</li>
    <li><strong>Narzędzie zarządzania kryzysowego:</strong> Zlokalizowana w kluczowych punktach sieć urządzeń, stanowiłaby pierwszy i najszybszy system wczesnego ostrzegania dla lokalnych organów.</li>
  </ul>

  <div class="partner-box">
    <h3 style="margin-top: 0; margin-bottom: 0.5rem;">Patronat / Partner Projektu</h3>
    <p style="margin: 0; font-size: 0.9rem;">[Miejsce na logotyp i nazwę Urzędu Miasta Ostrołęki]</p>
  </div>

  <div class="disclaimer">
    <strong>Uwaga:</strong> Projekt wykorzystuje autorski, niezależny sprzęt pomiarowy i na ten moment nie jest powiązany z Państwową Agencją Atomistyki (PAA). Stanowi on otwartą, obywatelską inicjatywę informacyjną dla mieszkańców, a nie oficjalny system powiadamiania państwa.
  </div>
</div>

<footer>
  Zbudowane na ESP8266 —
  <a href="https://icmt.cc/p/rad-the-local-radiaton-website/" target="_blank" data-i18n="more">Więcej tutaj</a>
</footer>

<script>
(() => {
  "use strict";

  let notifOn = false;
  let currentLang = "pl";
  
  const ctx = document.getElementById("chart").getContext("2d");
  const offlineEl = document.getElementById("offline");

  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "µSv/h",
          data: [],
          borderColor: "#2563eb",
          tension: 0.25,
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        x: { ticks: { color: "#aaa" } },
        y: { ticks: { color: "#aaa" }, beginAtZero: true },
      },
      plugins: { legend: { labels: { color: "#ccc" } } },
    },
  });

  const translations = {
    pl: {
      title: "Ostrołęcki System Monitorowania Radiacyjnego",
      avgLabel: "Średnia:",
      cpm: "CPM",
      offline: "Stacja wyłączona od",
      powered: "Zbudowane na ESP8266 —",
      more: "Więcej tutaj",
      notifyOn: "Powiadomienia: Wł.",
      notifyOff: "Powiadomienia: Wył.",
      safe: "Bezpiecznie",
      caution: "Uwaga",
      high: "Wysokie",
      danger: "Niebezpieczeństwo",
      range1h: "Ostatnia 1 godzina",
      range10h: "Ostatnie 10 godzin",
      range10d: "Ostatnie 10 dni",
      range50d: "Ostatnie 50 dni",
    },
    en: {
      title: "Ostrołęka Radiation Monitoring System",
      avgLabel: "Average:",
      cpm: "CPM",
      offline: "Station offline for",
      powered: "Powered by an ESP8266 —",
      more: "More here",
      notifyOn: "Notify: On",
      notifyOff: "Notify: Off",
      safe: "Safe",
      caution: "Caution",
      high: "High",
      danger: "Danger",
      range1h: "Last 1 hour",
      range10h: "Last 10 hours",
      range10d: "Last 10 days",
      range50d: "Last 50 days",
    }
  };

  const formatAgo = (ms) => {
    const s = Math.floor(ms / 1000);
    if (s < 60) return s + "s";
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + "m " + r + "s";
  };

  const getColor = (usv) => {
    if (usv <= 0.3) return "#00c9a7";
    if (usv <= 1) return "#ffeb3b";
    if (usv <= 5) return "#ff9800";
    return "#ff4f4f";
  };

  const fetchLatest = async () => {
    try {
      const r = await fetch("/latest");
      const d = await r.json();
      const color = getColor(d.instant_usv);

      document.getElementById("instant").textContent = d.instant_usv.toFixed(3) + " µSv/h";
      document.getElementById("instant").style.color = color;
      document.getElementById("avg").textContent = d.avg_usv.toFixed(3);
      document.getElementById("cpm").textContent = d.cpm;

      chart.data.datasets[0].borderColor = (d.instant_usv <= 0.3) ? "#2563eb" : color;
      chart.update();

      if (d.offline) {
        offlineEl.style.display = "block";
        offlineEl.textContent = "⚠️⚠️⚠️ " + translations[currentLang].offline + " " + formatAgo(d.lastSeenAgo);
      } else {
        offlineEl.style.display = "none";
      }

      if (notifOn && d.instant_usv > 0.5) {
        new Notification("Radiation Alert", {
          body: d.instant_usv.toFixed(3) + " µSv/h",
        });
      }
    } catch (e) {
      console.error("Failed to fetch latest:", e);
    }
  };

  const fetchHistory = async () => {
    try {
      const w = document.getElementById("range").value;
      const r = await fetch("/history?window=" + w);
      const d = await r.json();
      const points = d.data.map((row) => ({
        x: new Date(row.ts),
        y: row.usv,
      }));
      chart.data.labels = points.map((p) => p.x.toLocaleTimeString());
      chart.data.datasets[0].data = points.map((p) => p.y);
      chart.update();
    } catch (e) {
      console.error("Failed to fetch history:", e);
    }
  };

  const applyLang = (lang) => {
    const t = translations[lang] || translations["pl"];
    document.title = t.title;
    document.getElementById("mainTitle").textContent = t.title;
    document.querySelector("#langToggle").textContent = "🌐 " + lang.toUpperCase();
    
    const fields = ["avgLabel", "safe", "caution", "high", "danger", "range1h", "range10h", "range10d", "range50d"];
    fields.forEach(f => {
      const el = document.querySelector("[data-i18n='" + f + "']");
      if (el) el.textContent = t[f];
    });
    
    document.getElementById("notifToggle").textContent = notifOn ? t.notifyOn : t.notifyOff;

    document.querySelector("footer").innerHTML = 
      t.powered + " <a href='https://icmt.cc/p/rad-the-local-radiaton-website/' target='_blank' data-i18n='more'>" + t.more + "</a>";
  };

  document.addEventListener("DOMContentLoaded", () => {
    applyLang(currentLang);
    
    document.getElementById("langToggle").addEventListener("click", () => {
      const langs = Object.keys(translations);
      const i = langs.indexOf(currentLang);
      currentLang = langs[(i + 1) % langs.length];
      applyLang(currentLang);
    });

    document.getElementById("notifToggle").addEventListener("click", async (e) => {
      if (!notifOn) await Notification.requestPermission();
      notifOn = !notifOn;
      const t = translations[currentLang];
      e.target.textContent = notifOn ? t.notifyOn : t.notifyOff;
    });

    document.getElementById("range").addEventListener("change", fetchHistory);

    // Initial fetches and intervals
    setInterval(fetchLatest, 2000);
    setInterval(fetchHistory, 300000);
    fetchLatest();
    fetchHistory();
  });
})();
</script>
</body>
</html>`;
}
