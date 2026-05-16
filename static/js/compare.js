const MODEL_LABELS = {
  logistic:      "Logistic Regression",
  decision_tree: "Decision Tree",
  random_forest: "Random Forest"
};

const COLORS = {
  logistic:      "#2979ff",
  decision_tree: "#ffab00",
  random_forest: "#e91e8c"
};

const METRICS = ["accuracy", "precision", "recall", "f1", "roc_auc"];
const METRIC_LABELS = {
  accuracy:  "Accuracy",
  precision: "Precision",
  recall:    "Recall",
  f1:        "F1 Score",
  roc_auc:   "ROC AUC"
};

async function loadMetrics() {
  const res  = await fetch("/metrics");
  const data = await res.json();
  renderCards(data);
  renderTable(data);
  renderChart(data);
  renderWinner(data);
}

function renderCards(data) {
  const container = document.getElementById("metric-cards");
  METRICS.forEach(metric => {
    let bestModel = null, bestVal = -1;
    Object.entries(data).forEach(([model, vals]) => {
      if (vals[metric] > bestVal) { bestVal = vals[metric]; bestModel = model; }
    });
    const card = document.createElement("div");
    card.className = "metric-card best";
    card.innerHTML = `
      <h3>Best ${METRIC_LABELS[metric]}</h3>
      <div class="model-name">${MODEL_LABELS[bestModel]}</div>
      <div class="score">${bestVal}<span>%</span></div>
    `;
    container.appendChild(card);
  });
}

function renderTable(data) {
  const tbody = document.getElementById("table-body");
  METRICS.forEach(metric => {
    const vals = Object.entries(data).map(([m, v]) => ({ model: m, val: v[metric] }));
    const maxVal = Math.max(...vals.map(v => v.val));
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${METRIC_LABELS[metric]}</td>` +
      ["logistic", "decision_tree", "random_forest"].map(m => {
        const v = data[m][metric];
        return `<td class="${v === maxVal ? 'best-cell' : ''}">${v}%</td>`;
      }).join("");
    tbody.appendChild(tr);
  });
}

function renderChart(data) {
  const ctx = document.getElementById("barChart").getContext("2d");
  const models = ["logistic", "decision_tree", "random_forest"];

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: METRICS.map(m => METRIC_LABELS[m]),
      datasets: models.map(m => ({
        label: MODEL_LABELS[m],
        data: METRICS.map(metric => data[m][metric]),
        backgroundColor: COLORS[m] + "cc",
        borderColor: COLORS[m],
        borderWidth: 1,
        borderRadius: 6,
      }))
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#e8e8e8", font: { family: "DM Sans" } } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%` } }
      },
      scales: {
        x: { ticks: { color: "#888" }, grid: { color: "#2a2a2a" } },
        y: {
          min: 85, max: 100,
          ticks: { color: "#888", callback: v => v + "%" },
          grid: { color: "#2a2a2a" }
        }
      }
    }
  });
}

function renderWinner(data) {
  const scores = {};
  Object.entries(data).forEach(([model, vals]) => {
    scores[model] = Object.values(vals).reduce((a, b) => a + b, 0);
  });
  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const section = document.getElementById("winner-section");
  section.innerHTML = `
    <h2>🏆 Overall Best Model</h2>
    <div style="font-size:1.8rem;font-family:'Playfair Display',serif;color:#e8e8e8;margin:0.5rem 0">
      ${MODEL_LABELS[winner]}
    </div>
    <p>Highest combined score across Accuracy, Precision, Recall, F1, and ROC AUC.</p>
  `;
}

loadMetrics();
