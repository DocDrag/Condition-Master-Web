import { getRandomInt, getRandomFloat } from "./random.js";

document.addEventListener("DOMContentLoaded", function () {
  const answerZone = document.getElementById("answer-zone");
  const resetBtn = document.getElementById("reset-btn");
  const resultDiv = document.getElementById("result");
  const modeSelect = document.getElementById("mode-select");
  const totalQuestionsEl = document.getElementById("total-questions");
  const correctAnswersEl = document.getElementById("correct-answers");
  const incorrectAnswersEl = document.getElementById("incorrect-answers");
  const skipAnswersEl = document.getElementById("skip-answers");

  // เมื่อหน้าเว็บโหลดขึ้นมา ให้ปุ่ม Reset มีชื่อว่า "Start"
  resetBtn.innerHTML = '<i class="fas fa-random"></i> Start';
  resetBtn.className = "container-fluid btn btn-primary btn-lg";

  let totalQuestions = 0;
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let skipAnswers = 0;

  // ตรวจสอบว่าเกมหยุดอยู่หรือไม่
  let stopGame = false;

  // เก็บเงื่อนไขทั้งหมดที่จะนำไปใส่ใน if-else
  let choices = [];

  // จำนวนปุ่มทั้งหมดในเว็บ
  let buttonCount = 0;

  generateButtons();

  resetBtn.addEventListener("click", () => {
    if (!stopGame){
      // reset คะแนนกลับเป็นค่าเริ่มต้น
      resetGame();
    }
    // สุ่มคำถามขึ้นมาใหม่
    generateQuestion();
    syncStateToRemote();
  });

  function resetGame() {
    totalQuestions = 0;
    correctAnswers = 0;
    incorrectAnswers = 0;
    skipAnswers = 0;
    // ปรับการแสดงผลคะแนน
    updateScore();
  }

  function checkAnswer(keyClick) {
    let Answer = false;
    // ตรวจสอบว่าคำตอบถูกหรือไม่
    if (keyClick == choices[buttonCount]) {
      correctAnswers++;
      Answer = true;
    } else {
      incorrectAnswers++;
      Answer = false;
    }
    const trueBtn = document.getElementById(`box-${choices[buttonCount]}`);
    trueBtn.className = "container-fluid btn btn-success btn-lg";

    updateScore();
    return Answer
  }

  function generateButtons() {
    const mode = modeSelect.value;
    answerZone.innerHTML = ""; // ล้างปุ่มเก่า

    // reset ค่าปุ่มเดิม
    buttonCount = 0;
    if (mode === "basic") {
      buttonCount = 2;
    } else if (mode === "intermediate") {
      buttonCount = 3;
    } else if (mode === "advanced") {
      buttonCount = getRandomInt(3, 5);
    }

    for (let i = 1; i <= buttonCount; i++) {
      // สร้าง div .col
      const colDiv = document.createElement("div");
      colDiv.className = "col";

      // สร้างปุ่ม
      const button = document.createElement("button");
      button.id = `box-${i}`;
      button.className = "container-fluid btn btn-dark btn-lg";
      button.textContent = `box ${i}`;

      // เพิ่มปุ่มเข้าไปใน div .col
      colDiv.appendChild(button);

      // เพิ่ม div .col เข้าไปใน answerZone
      answerZone.appendChild(colDiv);

      // ผูก Event Listener กับปุ่มหลังจากที่ปุ่มถูกสร้างแล้ว
      button.addEventListener("click", () => {
        if (!stopGame){
          if (totalQuestions > 0) {
            // สั่งหยุดเกมชั่วคราวเมื่อกดปุ่ม
            stopGame = true;
            // เปลี่ยนชื่อปุ่มเป็นปุ่ม Next ชั่วคราว
            resetBtn.innerHTML = '<i class="fa-solid fa-forward"></i> Next';
            resetBtn.className = "container-fluid btn btn-warning btn-lg";
            // ตรวจสอบคำตอบ
            if (!checkAnswer(i)){
              button.className = "container-fluid btn btn-danger btn-lg";
            }
            syncStateToRemote();
          }
        }
      });
    }
  }

  function generateQuestion() {
    // สั่งให้เกมดำเนินการต่อเมื่อมีคำถามใหม่
    stopGame = false;
    // เปลี่ยนชื่อปุ่มคืนเป็น Reset
    resetBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Reset';
    resetBtn.className = "container-fluid btn btn-secondary btn-lg";

    generateButtons();
    const mode = modeSelect.value;
    let question;

    if (mode === "basic") {
      generateChoices(buttonCount);
      question = `if (${choices[0]}) {\n    // box 1\n}\nelse {\n    // box 2\n}`;
    } else if (mode === "intermediate") {
      generateChoices(buttonCount);
      question = `if (${choices[0]}) {\n    // box 1\n}\nelse if (${choices[1]}) {\n    // box 2\n}\nelse {\n    // box 3\n}`;
    } else if (mode === "advanced") {
      let i = 0;
      if (getRandomFloat(0, 1, 2) >= 0.7) {
        generateChoices(buttonCount);
        question = `if (${choices[0]}) {\n    // box 1\n}`;
        for (i = 2; i < buttonCount; i++) {
          question += `\nelse if (${choices[i-1]}) {\n    // box ${i}\n}`;
        }
        question += `\nelse {\n    // box ${buttonCount}\n}`;
      } else {
        if (getRandomFloat(0, 1, 2) >= 0.7 || buttonCount < 4) {
          generateChoices(buttonCount);
          if (choices[buttonCount] >= 2 && choices[buttonCount] <= buttonCount-1){
            question = `if (${generateCondition(true)}) {\n    // box 1`;
          }
          else{
            question = `if (${choices[0]}) {\n    // box 1`;
          }
          question += `\n    if (${choices[1]}) {\n        // box 2\n    }`;
          for (i = 3; i < buttonCount; i++) {
            question += `\n    else if (${choices[i-1]}) {\n        // box ${i}\n    }`;
          }
          question += `\n}`;
          question += `\nelse {\n    // box ${buttonCount}\n}`;
        } else {
          generateChoices(buttonCount-1);
          if (choices[buttonCount] >= 2 && choices[buttonCount] <= buttonCount-2){
            question = `if (${generateCondition(true)}) {\n    // box 1`;
          }
          else{
            question = `if (${choices[0]}) {\n    // box 1`;
          }
          question += `\n    if (${choices[1]}) {\n        // box 2\n    }`;
          for (i = 3; i < buttonCount - 1; i++) {
            question += `\n    else if (${choices[i-1]}) {\n        // box ${i}\n    }`;
          }
          question += `\n}`;
          question += `\nelse {\n    // box ${buttonCount - 1}`;
          question += `\n    if (${choices[buttonCount-1]}) {\n        // box ${buttonCount}\n    }`;
          question += `\n}`;
        }
      }
    }

    resultDiv.innerHTML = `<pre><code>${colorizeBrackets(question,false)}</code></pre>`;
    totalQuestions++;
    updateScore();
    syncStateToRemote();
  }

  // สร้างตัวเลือก
  function generateChoices(NullKeyBox) {
    choices = [];
    let allChoice = buttonCount;
    let answer = getRandomInt(1, allChoice);
    for(let i=1; i<=allChoice; i++){
      if (i == answer){
        choices.push(generateCondition(true));
      }
      else{
        choices.push(generateCondition(false));
      }
      // เปลี่ยนค่าเป็น null ในข้อที่เป็น else
      if (i == NullKeyBox){
        choices[i-1] = null;
      }
    }
    choices.push(answer);
  }

  // สร้างเงื่อนไข
  function generateCondition(keyCondition) {
    let mode = ["basic", "intermediate", "advanced"];
    mode = mode[Math.floor(Math.random() * mode.length)];

    const basicOperator = [" == ", " != ", " > ", " < ", " >= ", " <= "];
    const allOperator = [...basicOperator, "!", "&&", "||"];

    let condition;
    if (mode === "basic") {
      condition = generateBasic(basicOperator);
    } else if (mode === "intermediate") {
      condition = generateIntermediate(basicOperator, allOperator);
    } else if (mode === "advanced") {
      let randomChoice = getRandomFloat(0, 1, 2);
      if (randomChoice <= 0.33) {
        condition = generateIntermediate(basicOperator, allOperator);
      } else if (randomChoice <= 0.66) {
        condition = `!(${generateIntermediate(basicOperator, allOperator)})`;
      } else {
        const advancedOperator = ["&&", "||"];
        const randomQuestion =
          advancedOperator[
            Math.floor(Math.random() * advancedOperator.length)
          ];
        condition = `(${generateIntermediate(
          basicOperator,
          allOperator
        )}) ${randomQuestion} (${generateBasic(basicOperator)})`;
      }
    }

    if (!checkCondition(keyCondition, condition)) {
      condition = generateCondition(keyCondition);
    }

    return colorizeBrackets(condition);
  }

  // สร้างตัวเลขสำหรับเงื่อนไข
  function generateValue() {
    let value = getRandomInt(-100, 100);
    if (value < 0) {
      value = `(${value})`;
    }

    return value;
  }

  // สร้างเงื่อนไขขั้น Basic
  function generateBasic(basicOperator) {
    let aValue = generateValue();
    let bValue = generateValue();

    const randomQuestion =
      basicOperator[Math.floor(Math.random() * basicOperator.length)];

    return `${aValue}${randomQuestion}${bValue}`;
  }

  // สร้างเงื่อนไขขั้น Intermediate
  function generateIntermediate(basicOperator, allOperator) {
    const randomQuestion =
      allOperator[Math.floor(Math.random() * allOperator.length)];

    let text = "";

    if (randomQuestion === "!") {
      text = `!(${generateBasic(basicOperator)})`;
    } else if (randomQuestion === "&&") {
      text = `(${generateBasic(basicOperator)}) && (${generateBasic(basicOperator)})`;
    } else if (randomQuestion === "||") {
      text = `(${generateBasic(basicOperator)}) || (${generateBasic(basicOperator)})`;
    } else {
      text = generateBasic(basicOperator);
    }

    return text;
  }

  // ตรวจสอบเงื่อนไข
  function checkCondition(keyCondition, condition) {
    let evaluatedResult;
    try {
      evaluatedResult = eval(condition);
    } catch (error) {
      evaluatedResult = false;
    }
    
    return (keyCondition === evaluatedResult);
  }

  // ฟังก์ชันใส่สีให้กับวงเล็บและปีกกา
  function colorizeBrackets(expression, setDefault = true) {
    let colors;
    if (setDefault) {
      colors = ["red", "blue", "green", "orange"];
    } else {
      colors = ["orange", "green", "red", "blue"];
    }
    let colorIndex = 0;
    let depth = 0;

    return expression.replace(/[(){}]/g, (bracket) => {
      if (bracket === "(" || bracket === "{") {
        depth++;
        colorIndex = (depth - 1) % colors.length;
        return `<span style="color: ${colors[colorIndex]}">${bracket}</span>`;
      } else if (bracket === ")" || bracket === "}") {
        const coloredBracket = `<span style="color: ${
          colors[(depth - 1) % colors.length]
        }">${bracket}</span>`;
        depth--;
        return coloredBracket;
      }
    });
  }

  function updateScore() {
    totalQuestionsEl.textContent = `Total: ${totalQuestions}`;
    correctAnswersEl.textContent = `Correct: ${correctAnswers}`;
    incorrectAnswersEl.textContent = `Incorrect: ${incorrectAnswers}`;
    skipAnswersEl.textContent = `Skip: ${skipAnswers}`;
    updateProgressBar();
  }

  function updateProgressBar() {
    let total_questions = correctAnswers + incorrectAnswers
    const correctPercentage =
      total_questions > 0 ? (correctAnswers / total_questions) * 100 : 0;
    const incorrectPercentage =
      total_questions > 0 ? (incorrectAnswers / total_questions) * 100 : 0;

    const correctProgressBar = document.getElementById("correct-progress-bar");
    const incorrectProgressBar = document.getElementById(
      "incorrect-progress-bar"
    );

    correctProgressBar.style.width = correctPercentage + "%";
    correctProgressBar.setAttribute("aria-valuenow", correctPercentage);
    correctProgressBar.textContent = Math.round(correctPercentage) + "%";

    incorrectProgressBar.style.width = incorrectPercentage + "%";
    incorrectProgressBar.setAttribute("aria-valuenow", incorrectPercentage);
    incorrectProgressBar.textContent = Math.round(incorrectPercentage) + "%";
  }

  function changeModeSelect() {
    resetGame();
    generateQuestion();
    syncStateToRemote();
  }

  modeSelect.addEventListener("change", changeModeSelect);

  // ==========================================
  // Remote Control & Live Teaching Sync
  // ==========================================
  let isTeachingMode = false;
  let eventSource = null;

  function syncStateToRemote() {
    if (!isTeachingMode || !window.location.protocol.startsWith("http")) return;

    const buttonsData = [];
    const buttons = answerZone.querySelectorAll("button");
    buttons.forEach((btn, idx) => {
      buttonsData.push({
        id: btn.id,
        index: idx,
        text: btn.textContent,
        className: btn.className,
      });
    });

    const state = {
      questionText: resultDiv.innerText.trim(),
      totalQuestions: totalQuestions,
      correctAnswers: correctAnswers,
      incorrectAnswers: incorrectAnswers,
      stopGame: stopGame,
      resetBtnText: resetBtn.innerText.trim(),
      resetBtnClass: resetBtn.className,
      mode: modeSelect.value,
      buttons: buttonsData,
    };

    fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    }).catch(() => {});
  }

  function handleRemoteAction(data) {
    if (data.action === "request_state") {
      syncStateToRemote();
      return;
    }

    if (data.action === "click") {
      const el = document.getElementById(data.target);
      if (el) {
        el.classList.add("remote-click-active");
        setTimeout(() => el.classList.remove("remote-click-active"), 250);
        el.click();
      }
    } else if (data.action === "set_mode") {
      if (data.value && modeSelect.value !== data.value) {
        modeSelect.value = data.value;
        changeModeSelect();
      }
    }
  }

  function updateClientCountUI(count) {
    const remoteCountBadge = document.getElementById("remote-badge-count");
    const remotePillText = document.getElementById("remote-pill-text");
    const modalStatusText = document.getElementById("modal-status-text");
    const modalStatusDot = document.getElementById("modal-status-dot");

    const remoteDevices = Math.max(0, count - 1);

    if (remoteCountBadge) {
      remoteCountBadge.textContent = remoteDevices;
      remoteCountBadge.className = remoteDevices > 0 ? "badge bg-success ms-1" : "badge bg-secondary ms-1";
    }

    if (remotePillText) {
      remotePillText.textContent = remoteDevices > 0 ? `รีโมท: ${remoteDevices} เครื่อง 🟢` : "รีโมทมือถือ (Remote)";
    }

    if (modalStatusText) {
      if (remoteDevices > 0) {
        modalStatusText.textContent = `เชื่อมต่อแล้ว ${remoteDevices} เครื่อง (พร้อมควบคุมระยะไกล)`;
        if (modalStatusDot) modalStatusDot.className = "fas fa-circle text-success me-2 fs-6";
      } else {
        modalStatusText.textContent = "ยังไม่มีเครื่องเชื่อมต่อ (รอสแกน QR Code)";
        if (modalStatusDot) modalStatusDot.className = "fas fa-circle text-muted me-2 fs-6";
      }
    }
  }

  function initSSE() {
    if (!isTeachingMode || !window.location.protocol.startsWith("http")) return;
    if (eventSource) return;

    eventSource = new EventSource("/api/events");

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "action") {
          handleRemoteAction(data);
        } else if (data.type === "client_count") {
          updateClientCountUI(data.count);
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };
  }

  function populateServerInfo(info) {
    const urlTs = document.getElementById("url-tailscale");
    const urlWifi = document.getElementById("url-wifi");
    const qrTs = document.getElementById("qr-img-tailscale");
    const qrWifi = document.getElementById("qr-img-wifi");

    if (urlTs && info.tailscale_url) {
      urlTs.value = info.tailscale_url;
    } else if (urlTs) {
      urlTs.value = "ไม่พบ Tailscale IP (โปรดตรวจสอบการเปิด Tailscale)";
    }

    if (urlWifi && info.wifi_url) {
      urlWifi.value = info.wifi_url;
    } else if (urlWifi) {
      urlWifi.value = info.local_url + "/remote";
    }

    if (qrTs && info.tailscale_url) {
      qrTs.src = "/api/qrcode?target=tailscale";
      qrTs.style.display = "block";
    }
    if (qrWifi && info.wifi_url) {
      qrWifi.src = "/api/qrcode?target=wifi";
      qrWifi.style.display = "block";
    }

    setupCopyButtons();
  }

  function enableTeachingMode(info) {
    isTeachingMode = true;

    const teacherBar = document.getElementById("teacher-control-bar");
    if (teacherBar) {
      teacherBar.classList.remove("d-none");
      teacherBar.classList.add("d-flex");
    }

    populateServerInfo(info);
    initSSE();
    syncStateToRemote();
  }

  function setupCopyButtons() {
    const btnTs = document.getElementById("btn-copy-tailscale");
    const btnWifi = document.getElementById("btn-copy-wifi");

    if (btnTs) {
      btnTs.onclick = () => {
        const input = document.getElementById("url-tailscale");
        if (input && input.value) {
          navigator.clipboard.writeText(input.value);
          btnTs.innerHTML = '<i class="fas fa-check text-success"></i>';
          setTimeout(() => (btnTs.innerHTML = '<i class="fas fa-copy"></i>'), 1500);
        }
      };
    }

    if (btnWifi) {
      btnWifi.onclick = () => {
        const input = document.getElementById("url-wifi");
        if (input && input.value) {
          navigator.clipboard.writeText(input.value);
          btnWifi.innerHTML = '<i class="fas fa-check text-success"></i>';
          setTimeout(() => (btnWifi.innerHTML = '<i class="fas fa-copy"></i>'), 1500);
        }
      };
    }
  }

  // Fullscreen button toggle
  const btnFullscreen = document.getElementById("btn-fullscreen");
  if (btnFullscreen) {
    btnFullscreen.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        btnFullscreen.innerHTML = '<i class="fas fa-compress"></i>';
      } else {
        document.exitFullscreen().catch(() => {});
        btnFullscreen.innerHTML = '<i class="fas fa-expand"></i>';
      }
    });

    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) {
        btnFullscreen.innerHTML = '<i class="fas fa-expand"></i>';
      } else {
        btnFullscreen.innerHTML = '<i class="fas fa-compress"></i>';
      }
    });
  }

  // ==========================================
  // Auto-detect Python Server (run_server.py)
  // ถ้าไม่ได้กด run ผ่าน .py จะคงสถานะหน้าเว็บแบบเดิม
  // ==========================================
  function detectPythonServer() {
    const hostname = window.location.hostname;
    const isStaticHost =
      window.location.protocol === "file:" ||
      hostname.endsWith("github.io") ||
      hostname.includes("github.io");

    if (isStaticHost) {
      return;
    }

    fetch("/api/info", { cache: "no-store" })
      .then((res) => {
        if (res.ok && res.headers.get("content-type")?.includes("json")) {
          return res.json();
        }
        throw new Error("Not run_server.py");
      })
      .then((info) => {
        if (info && info.port) {
          enableTeachingMode(info);
        }
      })
      .catch(() => {});
  }

  detectPythonServer();
});
