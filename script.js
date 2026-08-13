// ===============================
// LAGFIX MAX - ROBLOX EDITION
// ===============================

const $ = (id) => document.getElementById(id);

const startButton = $("startTest");
const status = $("status");

const connectionResult = $("connectionResult");
const latencyResult = $("latencyResult");
const stabilityResult = $("stabilityResult");
const performanceResult = $("performanceResult");

const minimumResult = $("minimumResult");
const averageResult = $("averageResult");
const maximumResult = $("maximumResult");
const jitterResult = $("jitterResult");
const rangeResult = $("rangeResult");
const failureResult = $("failureResult");

const pingGraph = $("pingGraph");

const overallScore = $("overallScore");
const networkScore = $("networkScore");
const stabilityScore = $("stabilityScore");
const reliabilityScore = $("reliabilityScore");
const deviceScore = $("deviceScore");

const diagnosisTitle = $("diagnosisTitle");
const diagnosisText = $("diagnosisText");

const quickFix = $("quickFix");
const robloxGuide = $("robloxGuide");
const deviceInfo = $("deviceInfo");
const connectionInfo = $("connectionInfo");
const gearupResult = $("gearupResult");
const testHistory = $("testHistory");

const copyReport = $("copyReport");
const clearHistory = $("clearHistory");

let baseline = null;
let lastReport = null;
let history = [];

try {
  history = JSON.parse(
    localStorage.getItem("lagfixHistory") || "[]"
  );
} catch {
  history = [];
}


// ===============================
// HELPERS
// ===============================

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function average(numbers) {
  if (!numbers.length) return 0;

  return numbers.reduce(
    (a, b) => a + b,
    0
  ) / numbers.length;
}


// ===============================
// NETWORK TEST
// ===============================

async function testConnection() {

  const pings = [];
  let failures = 0;

  const totalTests = 20;

  for (let i = 0; i < totalTests; i++) {

    status.textContent =
      `● TESTING ${i + 1}/${totalTests}`;

    const start = performance.now();

    try {

      await fetch(
        "https://www.google.com/favicon.ico?lagfix=" +
        Date.now() +
        Math.random(),
        {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store"
        }
      );

      const ping = Math.round(
        performance.now() - start
      );

      pings.push(ping);

      latencyResult.textContent =
        ping + " ms";

    } catch {
      failures++;
    }

    await wait(250);
  }

  return {
    pings,
    failures,
    total: totalTests
  };
}


// ===============================
// ANALYZE CONNECTION
// ===============================

function analyzeConnection(
  pings,
  failures,
  total
) {

  const avg = average(pings);

  const minimum =
    Math.min(...pings);

  const maximum =
    Math.max(...pings);

  const range =
    maximum - minimum;

  const differences = [];

  for (let i = 1; i < pings.length; i++) {

    differences.push(
      Math.abs(
        pings[i] - pings[i - 1]
      )
    );
  }

  const jitter =
    average(differences);

  const failureRate =
    total > 0
      ? (failures / total) * 100
      : 0;

  return {
    average: Math.round(avg),
    minimum,
    maximum,
    range,
    jitter: Math.round(jitter),
    failures,
    failureRate:
      Math.round(failureRate * 10) / 10
  };
}


// ===============================
// PERFORMANCE TEST
// ===============================

function testPerformance() {

  const start =
    performance.now();

  let total = 0;

  for (
    let i = 0;
    i < 5000000;
    i++
  ) {
    total += Math.sqrt(i);
  }

  return Math.round(
    performance.now() - start
  );
}


// ===============================
// SCORE SYSTEM
// ===============================

function scoreLatency(ms) {

  if (ms < 30) return 100;
  if (ms < 50) return 90;
  if (ms < 75) return 75;
  if (ms < 100) return 60;
  if (ms < 150) return 40;
  if (ms < 250) return 25;

  return 10;
}

function scoreJitter(ms) {

  if (ms < 5) return 100;
  if (ms < 10) return 90;
  if (ms < 20) return 75;
  if (ms < 30) return 60;
  if (ms < 50) return 40;

  return 20;
}

function scoreReliability(
  failures,
  total
) {

  const rate =
    total > 0
      ? failures / total
      : 1;

  if (rate === 0) return 100;
  if (rate < 0.05) return 85;
  if (rate < 0.10) return 70;
  if (rate < 0.20) return 45;

  return 20;
}

function scorePerformance(ms) {

  if (ms < 75) return 100;
  if (ms < 100) return 90;
  if (ms < 150) return 80;
  if (ms < 200) return 70;
  if (ms < 300) return 55;
  if (ms < 450) return 35;

  return 20;
}


// ===============================
// UPDATE MEASUREMENTS
// ===============================

function updateMeasurements(data) {

  if (minimumResult)
    minimumResult.textContent =
      data.minimum + " ms";

  if (averageResult)
    averageResult.textContent =
      data.average + " ms";

  if (maximumResult)
    maximumResult.textContent =
      data.maximum + " ms";

  if (jitterResult)
    jitterResult.textContent =
      data.jitter + " ms";

  if (rangeResult)
    rangeResult.textContent =
      data.range + " ms";

  if (failureResult)
    failureResult.textContent =
      data.failureRate + "%";
}


// ===============================
// PING GRAPH
// ===============================

function createGraph(pings) {

  if (!pingGraph) return;

  pingGraph.innerHTML = "";

  if (!pings.length) {
    pingGraph.innerHTML =
      "<p>No measurements available.</p>";
    return;
  }

  const minimum =
    Math.min(...pings);

  const maximum =
    Math.max(...pings);

  const range =
    Math.max(
      maximum - minimum,
      1
    );

  pings.forEach(
    (ping, index) => {

      const bar =
        document.createElement("div");

      bar.className =
        "ping-bar";

      const height =
        20 +
        ((ping - minimum) / range) * 130;

      bar.style.height =
        height + "px";

      bar.title =
        `Test ${index + 1}: ${ping} ms`;

      pingGraph.appendChild(bar);
    }
  );
}


// ===============================
// SCORES
// ===============================

function updateScores(
  data,
  performanceTime
) {

  const network =
    scoreLatency(data.average);

  const stability =
    scoreJitter(data.jitter);

  const reliability =
    scoreReliability(
      data.failures,
      20
    );

  const device =
    scorePerformance(
      performanceTime
    );

  const overall =
    Math.round(
      (
        network +
        stability +
        reliability +
        device
      ) / 4
    );

  if (networkScore)
    networkScore.textContent =
      network;

  if (stabilityScore)
    stabilityScore.textContent =
      stability;

  if (reliabilityScore)
    reliabilityScore.textContent =
      reliability;

  if (deviceScore)
    deviceScore.textContent =
      device;

  if (overallScore)
    overallScore.textContent =
      overall;

  return {
    network,
    stability,
    reliability,
    device,
    overall
  };
}


// ===============================
// DIAGNOSIS
// ===============================

function createDiagnosis(
  data,
  performanceTime
) {

  if (
    data.average >= 100 &&
    data.jitter >= 30
  ) {

    return {
      title:
        "Network instability detected 🔴",

      text:
        "Your connection has high latency and high variation. This can cause online-game lag."
    };
  }

  if (data.average >= 100) {

    return {
      title:
        "High network latency 🔴",

      text:
        "Your connection is responding slowly. This can cause delayed actions in Roblox."
    };
  }

  if (data.jitter >= 30) {

    return {
      title:
        "Unstable connection 🔴",

      text:
        "Your ping changes significantly between tests."
    };
  }

  if (performanceTime >= 250) {

    return {
      title:
        "Device performance may be limiting FPS 🟡",

      text:
        "Your network looks reasonable, but your device performance test was slower."
    };
  }

  if (data.average >= 50) {

    return {
      title:
        "Moderate latency 🟡",

      text:
        "Your connection has some noticeable delay."
    };
  }

  return {
    title:
      "Connection looks good 🟢",

    text:
      "LagFix found relatively low latency and stable response times."
  };
}


// ===============================
// FIXES
// ===============================

function createFixes(
  data,
  performanceTime
) {

  if (!quickFix) return;

  quickFix.innerHTML = "";

  const fixes = [];

  if (data.average >= 100) {

    fixes.push([
      "📶 NETWORK",
      "Move closer to your router or use Ethernet if available."
    ]);

    fixes.push([
      "🌐 NETWORK TRAFFIC",
      "Pause large downloads, uploads, and streaming while playing Roblox."
    ]);

  } else {

    fixes.push([
      "📶 NETWORK",
      "Your measured network latency looks reasonably good."
    ]);
  }

  if (data.jitter >= 30) {

    fixes.push([
      "📊 STABILITY",
      "Your connection is unstable. Check whether other devices are heavily using your network."
    ]);

  } else {

    fixes.push([
      "📊 STABILITY",
      "No major jitter problem was detected."
    ]);
  }

  if (performanceTime >= 250) {

    fixes.push([
      "🎮 FPS",
      "Use the Roblox graphics tutorial below to improve FPS."
    ]);

  } else {

    fixes.push([
      "🎮 FPS",
      "The browser performance test did not detect a major slowdown."
    ]);
  }

  fixes.push([
    "🔄 ROUTER",
    "If your connection suddenly became worse, restarting your router may help."
  ]);

  fixes.forEach(fix => {

    const div =
      document.createElement("div");

    div.className =
      "fix-item";

    div.innerHTML = `
      <strong>${fix[0]}</strong>
      <span>${fix[1]}</span>
    `;

    quickFix.appendChild(div);
  });
}


// ===============================
// ROBLOX GRAPHICS TUTORIAL
// ===============================

function createRobloxGuide() {

  if (!robloxGuide) return;

  robloxGuide.innerHTML = "";

  const steps = [

    {
      title:
        "STEP 1 — Open Roblox Settings ⚙️",

      text:
        "Join your Roblox game, open the Roblox menu, and select Settings."
    },

    {
      title:
        "STEP 2 — Find Graphics Mode 🎨",

      text:
        "Find Graphics Mode in the settings menu. Set it to Manual instead of Automatic if you want direct control."
    },

    {
      title:
        "STEP 3 — Lower Graphics Quality 📉",

      text:
        "Move the Graphics Quality slider lower. Start around the middle and lower it more if your FPS is still low."
    },

    {
      title:
        "STEP 4 — Check Your FPS 🎮",

      text:
        "Watch your FPS while playing. If FPS improves after lowering graphics, your device was likely working too hard to render the game."
    },

    {
      title:
        "STEP 5 — Close Background Apps 💻",

      text:
        "Close unnecessary apps and browser tabs while playing. This can free up system resources."
    },

    {
      title:
        "STEP 6 — Keep Your Device Cool 🌡️",

      text:
        "If your device gets very hot, performance can decrease. Give it airflow and avoid blocking its vents."
    },

    {
      title:
        "STEP 7 — Know Your Type of Lag 🧠",

      text:
        "Low FPS usually points toward graphics/device performance. High ping or unstable ping points toward the network."
    },

    {
      title:
        "STEP 8 — Test Again 🔄",

      text:
        "After changing settings, run LagFix again and compare the results with your previous test."
    }

  ];

  steps.forEach(
    (step, index) => {

      const div =
        document.createElement("div");

      div.className =
        "guide-item";

      div.innerHTML = `
        <strong>${step.title}</strong>
        <span>${step.text}</span>
      `;

      robloxGuide.appendChild(div);
    }
  );
}


// ===============================
// DEVICE INFO
// ===============================

function createDeviceInfo() {

  if (!deviceInfo) return;

  const memory =
    navigator.deviceMemory
      ? navigator.deviceMemory + " GB"
      : "Not available";

  const cores =
    navigator.hardwareConcurrency ||
    "Not available";

  deviceInfo.innerHTML = `

    <div class="info-item">
      <span>CPU Threads</span>
      <strong>${cores}</strong>
    </div>

    <div class="info-item">
      <span>Memory Report</span>
      <strong>${memory}</strong>
    </div>

    <div class="info-item">
      <span>Screen</span>
      <strong>
        ${screen.width} × ${screen.height}
      </strong>
    </div>

    <div class="info-item">
      <span>Pixel Ratio</span>
      <strong>
        ${window.devicePixelRatio}
      </strong>
    </div>

    <div class="info-item">
      <span>Online</span>
      <strong>
        ${navigator.onLine
          ? "Yes 🟢"
          : "No 🔴"}
      </strong>
    </div>

  `;
}


// ===============================
// CONNECTION INFO
// ===============================

function createConnectionInfo() {

  if (!connectionInfo) return;

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (!connection) {

    connectionInfo.innerHTML = `
      <div class="info-item">
        <span>Network API</span>
        <strong>Not available</strong>
      </div>
    `;

    return;
  }

  connectionInfo.innerHTML = `

    <div class="info-item">
      <span>Connection Type</span>
      <strong>
        ${connection.effectiveType || "Unknown"}
      </strong>
    </div>

    <div class="info-item">
      <span>Browser RTT</span>
      <strong>
        ${
          connection.rtt != null
            ? connection.rtt + " ms"
            : "Unknown"
        }
      </strong>
    </div>

    <div class="info-item">
      <span>Downlink Estimate</span>
      <strong>
        ${
          connection.downlink != null
            ? connection.downlink + " Mbps"
            : "Unknown"
        }
      </strong>
    </div>

  `;
}


// ===============================
// GEARUP COMPARISON
// ===============================

function createGearup(data) {

  if (!gearupResult) return;

  if (!baseline) {

    baseline = {
      average: data.average,
      jitter: data.jitter
    };

    gearupResult.innerHTML = `
      <div class="info-item">
        <span>Baseline Saved</span>
        <strong>
          ${data.average} ms
        </strong>
      </div>

      <p>
        Run another test later to compare your connection.
      </p>
    `;

    return;
  }

  const difference =
    data.average -
    baseline.average;

  let message;

  if (difference < -5) {

    message =
      "Current ping is lower than your baseline 🟢";

  } else if (difference > 5) {

    message =
      "Current ping is higher than your baseline 🔴";

  } else {

    message =
      "Current ping is close to your baseline 🟡";
  }

  gearupResult.innerHTML = `

    <div class="info-grid">

      <div class="info-item">
        <span>Baseline</span>
        <strong>
          ${baseline.average} ms
        </strong>
      </div>

      <div class="info-item">
        <span>Current</span>
        <strong>
          ${data.average} ms
        </strong>
      </div>

    </div>

    <p>${message}</p>

    <p>
      ⚠️ This compares measurements only.
      It does not prove that GearUP caused the difference.
    </p>
  `;
}


// ===============================
// HISTORY
// ===============================

function saveTest(
  data,
  performanceTime,
  score
) {

  const record = {

    time:
      new Date().toLocaleString(),

    ping:
      data.average,

    jitter:
      data.jitter,

    performance:
      performanceTime,

    score:
      score
  };

  history.push(record);

  if (history.length > 10) {
    history.shift();
  }

  try {

    localStorage.setItem(
      "lagfixHistory",
      JSON.stringify(history)
    );

  } catch {}

  showHistory();
}


function showHistory() {

  if (!testHistory) return;

  if (!history.length) {

    testHistory.innerHTML =
      "<p>No tests recorded yet.</p>";

    return;
  }

  testHistory.innerHTML = "";

  [...history]
    .reverse()
    .forEach(
      (item, index) => {

        const div =
          document.createElement("div");

        div.className =
          "history-item";

        div.innerHTML = `
          <span>
            <strong>
              Test ${history.length - index}
            </strong>
            <br>
            ${item.time}
          </span>

          <span>
            ${item.ping} ms ping
            <br>
            ${item.jitter} ms jitter
            <br>
            ${item.score}/100
          </span>
        `;

        testHistory.appendChild(div);
      }
    );
}


// ===============================
// COPY REPORT
// ===============================

function buildReport() {

  if (!lastReport) {
    return "Run a LagFix test first.";
  }

  return `
LAGFIX MAX REPORT

Average latency:
${lastReport.average} ms

Minimum:
${lastReport.minimum} ms

Maximum:
${lastReport.maximum} ms

Jitter:
${lastReport.jitter} ms

Range:
${lastReport.range} ms

Failed requests:
${lastReport.failureRate}%

Performance:
${lastReport.performance} ms

Overall score:
${lastReport.score}/100

Diagnosis:
${lastReport.diagnosis}
  `.trim();
}


if (copyReport) {

  copyReport.addEventListener(
    "click",
    async () => {

      try {

        await navigator.clipboard.writeText(
          buildReport()
        );

        copyReport.textContent =
          "✅ REPORT COPIED";

        setTimeout(() => {

          copyReport.textContent =
            "📋 COPY REPORT";

        }, 1500);

      } catch {

        alert(
          buildReport()
        );
      }
    }
  );
}


// ===============================
// CLEAR HISTORY
// ===============================

if (clearHistory) {

  clearHistory.addEventListener(
    "click",
    () => {

      history = [];

      try {
        localStorage.removeItem(
          "lagfixHistory"
        );
      } catch {}

      showHistory();

      clearHistory.textContent =
        "✅ HISTORY CLEARED";

      setTimeout(() => {

        clearHistory.textContent =
          "🗑️ CLEAR HISTORY";

      }, 1500);
    }
  );
}


// ===============================
// MAIN TEST
// ===============================

startButton.addEventListener(
  "click",
  async () => {

    startButton.disabled = true;

    startButton.textContent =
      "⏳ TESTING...";

    status.textContent =
      "● RUNNING TEST";

    try {

      diagnosisTitle.textContent =
        "Running diagnostics...";

      diagnosisText.textContent =
        "LagFix is measuring your connection.";

      connectionResult.textContent =
        "Testing...";

      latencyResult.textContent =
        "Testing...";

      stabilityResult.textContent =
        "Testing...";

      performanceResult.textContent =
        "Testing...";


      // NETWORK
      const result =
        await testConnection();


      if (
        result.pings.length < 2
      ) {

        throw new Error(
          "Not enough network measurements."
        );
      }


      const data =
        analyzeConnection(
          result.pings,
          result.failures,
          result.total
        );


      updateMeasurements(data);

      createGraph(
        result.pings
      );


      // CONNECTION RESULT
      connectionResult.textContent =
        data.average < 50
          ? "Good 🟢"
          : data.average < 100
          ? "Fair 🟡"
          : "High latency 🔴";


      // STABILITY
      stabilityResult.textContent =
        data.jitter < 10
          ? "Very stable 🟢"
          : data.jitter < 30
          ? "Some variation 🟡"
          : "Unstable 🔴";


      // PERFORMANCE
      diagnosisTitle.textContent =
        "Testing device performance...";

      const performanceTime =
        testPerformance();


      performanceResult.textContent =
        performanceTime < 100
          ? "Good 🟢"
          : performanceTime < 250
          ? "Moderate 🟡"
          : "Slow 🔴";


      // SCORES
      const scores =
        updateScores(
          data,
          performanceTime
        );


      // DIAGNOSIS
      const diagnosis =
        createDiagnosis(
          data,
          performanceTime
        );


      diagnosisTitle.textContent =
        diagnosis.title;

      diagnosisText.textContent =
        diagnosis.text;


      // FEATURES
      createFixes(
        data,
        performanceTime
      );

      createRobloxGuide();

      createDeviceInfo();

      createConnectionInfo();

      createGearup(data);


      // REPORT
      lastReport = {

        ...data,

        performance:
          performanceTime,

        score:
          scores.overall,

        diagnosis:
          diagnosis.title
      };


      saveTest(
        data,
        performanceTime,
        scores.overall
      );


      diagnosisText.textContent +=
        " Test completed successfully.";


    } catch (error) {

      console.error(
        "LagFix error:",
        error
      );

      diagnosisTitle.textContent =
        "Test completed with a warning ⚠️";

      diagnosisText.textContent =
        "LagFix finished the measurements, but one feature could not load.";


    } finally {

      // IMPORTANT:
      // ALWAYS unlock the button.

      startButton.disabled =
        false;

      startButton.textContent =
        "🧪 RUN FULL TEST";

      status.textContent =
        "● READY";
    }

  }
);


// ===============================
// LOAD
// ===============================

showHistory();

console.log(
  "LagFix MAX Roblox Edition loaded."
);