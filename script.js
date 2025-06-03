const coefficients = Array.from({ length: 6 }, () => ["", ""]);
const weights = [0.6, 0.8, 1.0, 1.2, 1.3, 1.5];

let focusedIndex = 0;

const average1Elem = document.getElementById("average1");
const average2Elem = document.getElementById("average2");
const winnerElem = document.getElementById("winner");
const confidenceElem = document.getElementById("confidence");
const totalPredictionElem = document.getElementById("totalPrediction");
const smallestPointsElem = document.getElementById("smallestPoints");
const momentSummaryElem = document.getElementById("momentSummary");
const aiConclusionElem = document.getElementById("aiConclusion");
const inputRowsElem = document.getElementById("inputRows");

function formatInput(value) {
    const clean = value.replace(/[^0-9.]/g, '').slice(0, 4);
    return clean.includes('.') ? clean : clean.length === 1 ? clean + "." : clean;
}

function buildInputs() {
    for (let i = 0; i < 6; i++) {
        const row = document.createElement("div");
        row.className = "input-row";
        row.id = `row-${i}`;

        const label = document.createElement("label");
        label.textContent = `Гейм ${i + 5}`;

        const input1 = document.createElement("input");
        input1.placeholder = "Игрок 1";
        input1.inputMode = "decimal";
        input1.dataset.row = i;
        input1.dataset.col = 0;

        const input2 = document.createElement("input");
        input2.placeholder = "Игрок 2";
        input2.inputMode = "decimal";
        input2.dataset.row = i;
        input2.dataset.col = 1;

        input1.addEventListener("input", onInput);
        input2.addEventListener("input", onInput);

        row.appendChild(label);
        row.appendChild(input1);
        row.appendChild(input2);

        const comment = document.createElement("div");
        comment.className = "input-row comment";
        comment.style.display = "none";
        comment.id = `comment-${i}`;
        row.appendChild(comment);

        inputRowsElem.appendChild(row);
    }
}

function onInput(e) {
    const row = +e.target.dataset.row;
    const col = +e.target.dataset.col;
    const value = formatInput(e.target.value);
    e.target.value = value;
    coefficients[row][col] = value;

    const nextIndex = row * 2 + col + 1;

    if (value.length >= 4 && nextIndex < 12) {
        const nextInput = document.querySelector(`input[data-row="${Math.floor(nextIndex / 2)}"][data-col="${nextIndex % 2}"]`);
        if (nextInput) nextInput.focus();
    } else if (nextIndex >= 12) {
        e.target.blur(); // Скрыть клавиатуру
    }

    calculate();
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

    const diff = Math.abs(avg1 - avg2);
    const confidence = Math.min(1.0, diff / 0.5);
    confidenceElem.textContent = `Уверенность прогноза: ${Math.round(confidence * 100)}%`;
    totalPredictionElem.textContent = diff <= 0.3 ? "Рекомендуется ТБ 20.5" : "Рекомендуется ТМ 20.5";
    totalPredictionElem.style.color = diff <= 0.3 ? "green" : "red";

    const total = avg1 + avg2;
    const p1 = total ? (avg1 / total) * 21 : 0;
    const p2 = total ? (avg2 / total) * 21 : 0;
    smallestPointsElem.textContent = `Очки более слабого игрока: ${Math.min(p1, p2).toFixed(2)}`;

    detectKeyMoments();
    applyAIScoring(avg1, avg2);
}

function detectKeyMoments() {
    let comebacks = 0, losses = 0, switches = 0;
    let previousLeader = null;

    for (let i = 1; i < 6; i++) {
        const prev1 = parseFloat(coefficients[i - 1][0]) || 0;
        const prev2 = parseFloat(coefficients[i - 1][1]) || 0;
        const curr1 = parseFloat(coefficients[i][0]) || 0;
        const curr2 = parseFloat(coefficients[i][1]) || 0;

        const diffPrev = prev1 - prev2;
        const diffCurr = curr1 - curr2;

        const currLeader = diffCurr < 0 ? 2 : diffCurr > 0 ? 1 : 0;
        if (previousLeader !== null && currLeader !== 0 && previousLeader !== currLeader) {
            switches++;
        }
        if (currLeader !== 0) previousLeader = currLeader;

        let msg = "";
        if (Math.abs(diffPrev) > 0.2 && diffPrev * diffCurr < 0) {
            msg = diffCurr > 0 ? "Игрок 1 делает камбэк!" : "Игрок 2 делает камбэк!";
            comebacks++;
        } else if (Math.abs(curr1 - prev1) > 0.4 || Math.abs(curr2 - prev2) > 0.4) {
            msg = curr1 < prev1 ? "Игрок 1 теряет преимущество!" : "Игрок 2 теряет преимущество!";
            losses++;
        }

        const comment = document.getElementById(`comment-${i}`);
        if (msg) {
            comment.textContent = msg;
            comment.style.display = "block";
        } else {
            comment.style.display = "none";
        }
    }

    momentSummaryElem.textContent = `Камбэков: ${comebacks}, Потерь преимущества: ${losses}, Смен лидерства: ${switches}`;

    if (switches >= 2) {
        aiConclusionElem.textContent = "Игра непредсказуема: частые переходы инициативы.";
    } else if (comebacks > 0) {
        aiConclusionElem.textContent = "Наблюдаются камбэки — игроки борются за инициативу.";
    } else {
        aiConclusionElem.textContent = "Игра сбалансирована, победитель неочевиден.";
    }
}

function applyAIScoring(avg1, avg2) {
    let trend1 = 0, trend2 = 0, delta1 = 0, delta2 = 0;

    delta1 = (parseFloat(coefficients[0][0]) || 0) - (parseFloat(coefficients[5][0]) || 0);
    delta2 = (parseFloat(coefficients[0][1]) || 0) - (parseFloat(coefficients[5][1]) || 0);

    for (let i = 1; i < 6; i++) {
        trend1 += (parseFloat(coefficients[i - 1][0]) || 0) - (parseFloat(coefficients[i][0]) || 0);
        trend2 += (parseFloat(coefficients[i - 1][1]) || 0) - (parseFloat(coefficients[i][1]) || 0);
    }

    const score1 = avg1 * 0.5 + trend1 * 0.3 + delta1 * 0.2;
    const score2 = avg2 * 0.5 + trend2 * 0.3 + delta2 * 0.2;

    if (score1 < score2) {
        winnerElem.textContent = "Победитель: Игрок 1";
    } else if (score2 < score1) {
        winnerElem.textContent = "Победитель: Игрок 2";
    } else {
        winnerElem.textContent = "Победитель: не определён";
    }
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

