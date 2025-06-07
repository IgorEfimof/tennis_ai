// Полный обновлённый JS-файл с логикой AI анализа

const coefficients = Array.from({ length: 6 }, () => ["", ""]);
const weights = [0.6, 0.8, 1.0, 1.2, 1.3, 1.5];

const average1Elem = document.getElementById("average1");
const average2Elem = document.getElementById("average2");
const winnerElem = document.getElementById("winner");
const confidenceElem = document.getElementById("confidence");
const totalPredictionElem = document.getElementById("totalPrediction");
const smallestPointsElem = document.getElementById("smallestPoints");
const momentSummaryElem = document.getElementById("momentSummary");
const aiConclusionElem = document.getElementById("aiConclusion");
const volatilityAnalysisElem = document.getElementById("volatilityAnalysis");
const peakAnalysisElem = document.getElementById("peakAnalysis");
const trendAnalysisElem = document.getElementById("trendAnalysis");
const inputRowsElem = document.getElementById("inputRows");

let coeffChart = null;

function formatInput(value) {
  const clean = value.replace(/[^0-9.]/g, '').slice(0, 4);
  return clean.includes('.') ? clean : clean.length === 1 ? clean + "." : clean;
}

function buildInputs() {
  for (let i = 0; i < 6; i++) {
    const wrapper = document.createElement("div");
    wrapper.className = "input-wrapper";

    const row = document.createElement("div");
    row.className = "input-row";
    row.id = `row-${i}`;

    const input1 = document.createElement("input");
    input1.placeholder = "Игрок 1";
    input1.inputMode = "decimal";
    input1.dataset.row = i;
    input1.dataset.col = 0;
    input1.maxLength = 4;

    const label = document.createElement("label");
    label.textContent = `Гейм ${i + 5}`;
    label.className = "game-label";

    const input2 = document.createElement("input");
    input2.placeholder = "Игрок 2";
    input2.inputMode = "decimal";
    input2.dataset.row = i;
    input2.dataset.col = 1;
    input2.maxLength = 4;

    input1.addEventListener("input", onInput);
    input2.addEventListener("input", onInput);

    row.appendChild(input1);
    row.appendChild(label);
    row.appendChild(input2);

    const comment = document.createElement("div");
    comment.className = "input-row comment";
    comment.style.display = "none";
    comment.id = `comment-${i}`;

    wrapper.appendChild(row);
    wrapper.appendChild(comment);
    inputRowsElem.appendChild(wrapper);
  }
}

function onInput(e) {
  const row = +e.target.dataset.row;
  const col = +e.target.dataset.col;
  const value = formatInput(e.target.value);
  e.target.value = value;
  coefficients[row][col] = value;

  calculate();

  if (value.length >= 3) {
    const nextCol = col === 0 ? 1 : 0;
    const nextRow = col === 0 ? row : row + 1;

    if (nextRow < 6) {
      const nextInput = document.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"]`);
      if (nextInput) nextInput.focus();
    }
  }
}

function calculate() {
  let wt1 = 0, ws1 = 0, wt2 = 0, ws2 = 0;
  for (let i = 0; i < 6; i++) {
    const c1 = parseFloat(coefficients[i][0]) || 0;
    const c2 = parseFloat(coefficients[i][1]) || 0;
    if (c1 > 0) {
      wt1 += c1 * weights[i];
      ws1 += weights[i];
    }
    if (c2 > 0) {
      wt2 += c2 * weights[i];
      ws2 += weights[i];
    }
  }

  const avg1 = ws1 ? wt1 / ws1 : 0;
  const avg2 = ws2 ? wt2 / ws2 : 0;
  average1Elem.textContent = `Средний кф. Игрок 1: ${avg1.toFixed(2)}`;
  average2Elem.textContent = `Средний кф. Игрок 2: ${avg2.toFixed(2)}`;

  const total = avg1 + avg2;
  const p1 = total ? (avg1 / total) * 21 : 0;
  const p2 = total ? (avg2 / total) * 21 : 0;
  smallestPointsElem.textContent = `Очки более слабого игрока: ${Math.min(p1, p2).toFixed(2)}`;

  applyAIScoring(avg1, avg2);
  calculateConfidence(avg1, avg2);
  detectKeyMoments();
  renderChart();
  smartInsights();
}

function getVolatility(index) {
  let v = 0;
  for (let i = 1; i < 6; i++) {
    const a = parseFloat(coefficients[i][index]) || 0;
    const b = parseFloat(coefficients[i - 1][index]) || 0;
    v += Math.abs(a - b);
  }
  return v / 5;
}

function calculateConfidence(avg1, avg2) {
  const diff = Math.abs(avg1 - avg2);
  const base = Math.min(1.0, diff / 0.5);
  const stab = 1 - (getVolatility(0) + getVolatility(1)) / 2;
  const confidence = Math.max(0, Math.min(1, base * stab));
  confidenceElem.textContent = `Уверенность прогноза: ${Math.round(confidence * 100)}%`;

  totalPredictionElem.textContent = diff <= 0.3 ? "Рекомендуется ТБ 20.5" : "Рекомендуется ТМ 20.5";
  totalPredictionElem.style.color = diff <= 0.3 ? "green" : "red";
}

function detectKeyMoments() {
  const confidenceText = confidenceElem.textContent;
  const winnerText = winnerElem.textContent;

  const confidenceMatch = confidenceText.match(/(\d+)%/);
  const winnerMatch = winnerText.match(/Игрок (\d)/);

  if (!confidenceMatch || !winnerMatch) {
    aiConclusionElem.textContent = "Недостаточно данных для анализа.";
    return;
  }

  const confidence = parseInt(confidenceMatch[1], 10);
  const winner = parseInt(winnerMatch[1], 10);

  const remaining = 100 - confidence;
  const altPlayer = winner === 1 ? 2 : 1;
  const adjusted = remaining - confidence;

  aiConclusionElem.textContent = `AI анализ: Игрок ${altPlayer} может победить с вероятностью ${adjusted > 0 ? adjusted : 0}%`;
  momentSummaryElem.textContent = "";
}

function applyAIScoring(avg1, avg2) {
  let trend1 = 0, trend2 = 0;

  for (let i = 1; i < 6; i++) {
    trend1 += (parseFloat(coefficients[i - 1][0]) || 0) - (parseFloat(coefficients[i][0]) || 0);
    trend2 += (parseFloat(coefficients[i - 1][1]) || 0) - (parseFloat(coefficients[i][1]) || 0);
  }

  const score1 = avg1 * 0.6 + trend1 * 0.4;
  const score2 = avg2 * 0.6 + trend2 * 0.4;

  if (score1 > score2) {
    winnerElem.textContent = "Победитель: Игрок 1";
  } else if (score2 > score1) {
    winnerElem.textContent = "Победитель: Игрок 2";
  } else {
    winnerElem.textContent = "Победитель: не определён";
  }
}

function renderChart() {
  const labels = ["Гейм 5", "6", "7", "8", "9", "10"];
  const data1 = coefficients.map(row => parseFloat(row[0]) || null);
  const data2 = coefficients.map(row => parseFloat(row[1]) || null);

  const ctx = document.getElementById('coeffChart').getContext('2d');
  if (coeffChart) coeffChart.destroy();
  coeffChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Игрок 1', data: data1, borderColor: 'blue', fill: false },
        { label: 'Игрок 2', data: data2, borderColor: 'red', fill: false }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: false } }
    }
  });
}

function smartInsights() {
  const v1 = getVolatility(0).toFixed(2);
  const v2 = getVolatility(1).toFixed(2);
  volatilityAnalysisElem.innerHTML = `Волатильность: Игрок 1 – ${v1}, Игрок 2 – ${v2}`;

  const trends = [[], []];
  for (let i = 1; i < 6; i++) {
    for (let j = 0; j < 2; j++) {
      const delta = (parseFloat(coefficients[i - 1][j]) || 0) - (parseFloat(coefficients[i][j]) || 0);
      trends[j].push(delta);
    }
  }

  const sum = arr => arr.reduce((a, b) => a + b, 0);
  const trend1 = sum(trends[0]);
  const trend2 = sum(trends[1]);

  trendAnalysisElem.innerHTML = `Общий тренд: Игрок 1 – ${trend1.toFixed(2)}, Игрок 2 – ${trend2.toFixed(2)}`;

  const peaks = (arr) => {
    let up = 0, down = 0;
    for (let i = 1; i < arr.length; i++) {
      const prev = arr[i - 1], curr = arr[i];
      if (prev && curr) {
        if (curr - prev > 0.3) up++;
        if (prev - curr > 0.3) down++;
      }
    }
    return { up, down };
  };

  const p1 = peaks(coefficients.map(r => parseFloat(r[0])));
  const p2 = peaks(coefficients.map(r => parseFloat(r[1])));
  peakAnalysisElem.innerHTML = `Резких подъёмов/падений: Игрок 1 – ▲${p1.up} ▼${p1.down}, Игрок 2 – ▲${p2.up} ▼${p2.down}`;
}

document.getElementById("clearButton").addEventListener("click", () => {
  for (let i = 0; i < 6; i++) {
    coefficients[i][0] = "";
    coefficients[i][1] = "";
    document.querySelector(`input[data-row="${i}"][data-col="0"]`).value = "";
    document.querySelector(`input[data-row="${i}"][data-col="1"]`).value = "";
    document.getElementById(`comment-${i}`).style.display = "none";
  }
  calculate();
});

buildInputs();
