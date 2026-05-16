const MEAN_FEATURES  = FEATURES.slice(0, 10);
const ERROR_FEATURES = FEATURES.slice(10, 20);
const WORST_FEATURES = FEATURES.slice(20, 30);

// Sample values (from a real benign case in the dataset)
const SAMPLE = {
  "mean radius": 13.54, "mean texture": 14.36, "mean perimeter": 87.46,
  "mean area": 566.3, "mean smoothness": 0.09779, "mean compactness": 0.08129,
  "mean concavity": 0.06664, "mean concave points": 0.04781,
  "mean symmetry": 0.1885, "mean fractal dimension": 0.05766,
  "radius error": 0.2699, "texture error": 0.7886, "perimeter error": 2.058,
  "area error": 23.56, "smoothness error": 0.008462, "compactness error": 0.0146,
  "concavity error": 0.02387, "concave points error": 0.01315,
  "symmetry error": 0.0198, "fractal dimension error": 0.0023,
  "worst radius": 15.11, "worst texture": 19.26, "worst perimeter": 99.7,
  "worst area": 711.2, "worst smoothness": 0.144, "worst compactness": 0.1773,
  "worst concavity": 0.239, "worst concave points": 0.1288,
  "worst symmetry": 0.2977, "worst fractal dimension": 0.07259
};

let selectedModel = "logistic";

function buildGrid(containerId, featureList) {
  const grid = document.getElementById(containerId);
  featureList.forEach(name => {
    const div = document.createElement("div");
    div.className = "field";
    const id = "f_" + name.replace(/\s+/g, "_");
    div.innerHTML = `
      <label for="${id}">${name}</label>
      <input type="number" step="any" id="${id}" name="${name}" placeholder="0.00" required/>
    `;
    grid.appendChild(div);
  });
}

buildGrid("mean-grid",  MEAN_FEATURES);
buildGrid("error-grid", ERROR_FEATURES);
buildGrid("worst-grid", WORST_FEATURES);

// Model tab switching
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedModel = btn.dataset.model;
  });
});

// Fill sample data
document.getElementById("fill-sample").addEventListener("click", () => {
  FEATURES.forEach(name => {
    const id = "f_" + name.replace(/\s+/g, "_");
    document.getElementById(id).value = SAMPLE[name];
  });
});

// Predict
document.getElementById("predict-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("predict-btn");
  btn.textContent = "Analyzing...";
  btn.disabled = true;

  const features = {};
  FEATURES.forEach(name => {
    const id = "f_" + name.replace(/\s+/g, "_");
    features[name] = parseFloat(document.getElementById(id).value);
  });

  try {
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: selectedModel, features })
    });
    const data = await res.json();

    if (data.error) { alert("Error: " + data.error); return; }

    const card = document.getElementById("result-card");
    card.className = "result-card " + (data.prediction === "Benign" ? "benign" : "malignant");

    document.getElementById("result-icon").textContent    = data.prediction === "Benign" ? "✅" : "⚠️";
    document.getElementById("result-label").textContent   = data.prediction;
    document.getElementById("result-confidence").textContent =
      `Confidence: ${data.confidence}% using ${selectedModel.replace("_", " ")}`;

    document.getElementById("bar-mal").style.width = data.malignant_prob + "%";
    document.getElementById("bar-ben").style.width = data.benign_prob + "%";
    document.getElementById("pct-mal").textContent = data.malignant_prob + "%";
    document.getElementById("pct-ben").textContent = data.benign_prob + "%";

    card.classList.remove("hidden");
    card.scrollIntoView({ behavior: "smooth", block: "center" });

  } catch (err) {
    alert("Could not connect to server.");
  } finally {
    btn.textContent = "🔍 Predict";
    btn.disabled = false;
  }
});
