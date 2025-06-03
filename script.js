let coefficients = Array.from({ length: 6 }, () => ["", ""]);

function createInputs() {
    const container = document.getElementById("inputs");
    container.innerHTML = "";
    for (let i = 0; i < 6; i++) {
        const row = document.createElement("div");
        row.className = "row";

        const label = document.createElement("label");
        label.textContent = `Гейм ${i + 5}`;

        const input1 = document.createElement("input");
        input1.placeholder = "Игрок 1";
        input1.dataset.row = i;
        input1.dataset.col = 0;
        input1.value = coefficients[i][0];
        input1.addEventListener("input", onInput);

        const input2 = document.createElement("input");
        input2.placeholder = "Игрок 2";
        input2.dataset.row = i;
        input2.dataset.col = 1;
        input2.value = coefficients[i][1];
        input2.addEventListener("input", onInput);

        row.appendChild(label);
        row.appendChild(input1);
        row.appendChild(input2);
        container.appendChild(row);
    }
}

function formatInput(value) {
    let filtered = value.replace(/[^0-9.]/g, "");
    if (filtered.length === 1) filtered += ".";
    return filtered.slice(0, 4);
}

function onInput(e) {
    const row = +e.target.dataset.row;
    const col = +e.target.dataset.col;
    const value = formatInput(e.target.value);
    e.target.value = value;
    coefficients[row][col] = value;

    const isLastField = row === 5 && col === 1;
    const nextIndex = row * 2 + col + 1;

    if (value.length >= 4 && !isLastField) {
        const nextInput = document.querySelector(`input[data-row="${Math.floor(nextIndex / 2)}"][data-col="${nextIndex % 2}"]`);
        if (nextInput) nextInput.focus();
    } else if (isLastField) {
        e.target.blur(); // Скрываем клавиатуру
        setTimeout(() => {
            document.getElementById("stats").scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100); // немного позже, чтобы клавиатура точно спряталась
    }

    calculate();
}

function calculate() {
    const weights = [0.6, 0.8, 1.0, 1.2, 1.3, 1.5];
    let wt1 = 0, ws1 = 0, wt2 = 0, ws2 = 0;
    for (let i = 0; i < 6; i++) {
        const c1 = parseFloat(coefficients[i][0]) || 0;
        const c2 = parseFloat(coefficients[i][1]) || 0;
        if (c1 > 0) { wt1 += c1 * weights[i]; ws1 += weights[i]; }
        if (c2 > 0) { wt2 += c2 * weights[i]; ws2 += weights[i]; }
    }

    const avg1 = ws1 > 0 ? wt1 / ws1 : 0;
    const avg2 = ws2 > 0 ? wt2 / ws2 : 0;
    const diff = Math.abs(avg1 - avg2);
    const confidence = Math.min(1.0, diff / 0.5);
    const totalCoeff = avg1 + avg2;
    const points1 = (avg1 / totalCoeff) * 21;
    const points2 = (avg2 / totalCoeff) * 21;
    const smallest = Math.min(points1, points2);

    const winner = (avg1 < avg2) ? 1 : (avg2 < avg1) ? 2 : 0;
    const recommendation = diff <= 0.30 ? "Рекомендуется ТБ 20.5" : "Рекомендуется ТМ 20.5";
    const color = diff <= 0.30 ? "green" : "red";

    document.getElementById("avg1").textContent = avg1.toFixed(2);
    document.getElementById("avg2").textContent = avg2.toFixed(2);
    document.getElementById("winner").textContent = winner === 1 ? "Игрок 1" : winner === 2 ? "Игрок 2" : "не определён";
    document.getElementById("confidence").textContent = Math.round(confidence * 100) + "%";
    const recEl = document.getElementById("recommendation");
    recEl.textContent = recommendation;
    recEl.className = `recommend ${color}`;
    document.getElementById("smallestPoints").textContent = smallest.toFixed(2);

    // AI Analysis
    let comebacks = 0, advLosses = 0, leadSwitches = 0, prevLeader = null;
    for (let i = 1; i < 6; i++) {
        const prev1 = parseFloat(coefficients[i - 1][0]) || 0;
        const prev2 = parseFloat(coefficients[i - 1][1]) || 0;
        const cur1 = parseFloat(coefficients[i][0]) || 0;
        const cur2 = parseFloat(coefficients[i][1]) || 0;

        const diffPrev = prev1 - prev2;
        const diffCur = cur1 - cur2;

        const leader = diffCur < 0 ? 2 : diffCur > 0 ? 1 : 0;
        if (prevLeader && leader !== prevLeader && leader !== 0) leadSwitches++;
        if (leader !== 0) prevLeader = leader;

        if (Math.abs(diffPrev) > 0.2 && diffPrev * diffCur < 0) comebacks++;
        else if (Math.abs(cur1 - prev1) > 0.4 || Math.abs(cur2 - prev2) > 0.4) advLosses++;
    }

    document.getElementById("comebacks").textContent = comebacks;
    document.getElementById("advLosses").textContent = advLosses;
    document.getElementById("leadSwitches").textContent = leadSwitches;

    const ai = document.getElementById("aiConclusion");
    if (leadSwitches >= 2) ai.textContent = "Игра непредсказуема: частые переходы инициативы.";
    else if (comebacks > 0) ai.textContent = "Наблюдаются камбэки — игроки борются за инициативу.";
    else if (winner === 1 || winner === 2) ai.textContent = `Игрок ${winner} доминирует и, скорее всего, победит.`;
    else ai.textContent = "Игра сбалансирована, победитель неочевиден.";
}

function clearData() {
    coefficients = Array.from({ length: 6 }, () => ["", ""]);
    createInputs();
    calculate();
}

createInputs();
calculate();
