const weights = [0.6, 0.8, 1.0, 1.2, 1.3, 1.5];
let coefficients = Array.from({ length: 6 }, () => ["", ""]);

function createGameInputs() {
  const container = document.getElementById("gameInputs");
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("div");
    row.className = "game-row";

    const label = document.createElement("label");
    label.textContent = `Гейм ${i + 5}`;
    row.appendChild(label);

    const input1 = document.createElement("input");
    input1.type = "text";
    input1.placeholder = "Игрок 1";
    input1.dataset.index = i;
    input1.dataset.player = 0;
    input1.addEventListener("input", handleInput);
    row.appendChild(input1);

    const input2 = document.createElement("input");
    input2.type = "text";
    input2.placeholder = "Игрок 2";
    input2.dataset.index = i;
    input2.dataset.player = 1;
    input2.addEventListener("input", handleInput);
    row.appendChild(input2);

    container.appendChild(row);
  }
}

function handleInput(e) {
  const index = e.target.dataset.index;
  const player = e.target.dataset.player;
  let value = e.target.value.replace(/[^0-9.]/g, "");
  if (value.length === 1) value += ".";
  if (value.length > 4) value = value.slice(0, 4);
  e.target.value = value;
  coefficients[index][player] = value;
  calculateAverages();
}

function calculateAverages() {
  let total1 = 0, total2 = 0, sumWeights1 = 0, sumWeights2 = 0;
  for (let i = 0; i < 6; i++) {
    const w = weights[i];
    const c1 = parseFloat(coefficients[i][0]);
    const c2 = parseFloat(coefficients[i][1]);
    if (!isNaN(c1) && c1 > 0) {
      total1 += c1 * w;
      sumWeights1 += w;
    }
    if (!isNaN(c2) && c2 > 0) {
      total2 += c2 * w;
      sumWeights2 += w;
    }
  }
  const avg1 = sumWeights1 ? total1 / sumWeights1 : 0;
  const avg2 = sumWeights2 ? total2 / sumWeights2 : 0;
  document.getElementById("avgPlayer1").textContent = avg1.toFixed(2);
  document.getElementById("avgPlayer2").textContent = avg2.toFixed(2);

  const diff = Math.abs(avg1 - avg2);
  const confidence = Math.min(1.0, diff / 0.5);
  document.getElementById("confidence").textContent = `${Math.round(confidence * 100)}%`;

  const totalCoeff = avg1 + avg2;
  const points1 = (avg1 / totalCoeff) * 21;
  const points2 = (avg2 / totalCoeff) * 21;
  const smallestPoints = Math.min(points1, points2);
  document.getElementById("smallestPoints").textContent = smallestPoints.toFixed(2);

  document.getElementById("totalPrediction").textContent = diff <= 0.3 ? "Рекомендуется ТБ 20.5" : "Рекомендуется ТМ 20.5";

  const winner = avg1 < avg2 ? "Игрок 1" : avg2 < avg1 ? "Игрок 2" : "не определён";
  document.getElementById("winner").textContent = winner;

  // AI Conclusion logic can be added here
  document.getElementById("aiConclusion").textContent = "Игра сбалансирована, победитель неочевиден.";
}

function clearData() {
  coefficients = Array.from({ length: 6 }, () => ["", ""]);
  document.getElementById("avgPlayer1").textContent = "0.00";
  document.getElementById("avgPlayer2").textContent = "0.00";
  document.getElementById("winner").textContent = "не определён";
  document.getElementById("confidence").textContent = "0%";
  document.getElementById("totalPrediction").textContent = "Рекомендуется ТБ 20.5";
  document.getElementById("smallestPoints").textContent = "0.00";
  document.getElementById("aiConclusion").textContent = "Игра сбалансирована, победитель неочевиден.";

  const inputs = document.querySelectorAll("#gameInputs input");
  inputs.forEach(input => input.value = "");
}

document.getElementById("clearButton").addEventListener("click", clearData);

createGameInputs();
