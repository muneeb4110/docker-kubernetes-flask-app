// This file has three small jobs:
//   1. loadInfo()      -> ask the server "who are you?" and show the answer in the cards
//   2. checkHealth()   -> ask /health and show a green or red dot
//   3. sendRequests()  -> send many requests and count which pod answered each one

// ---------- Small helpers ----------

// Shortcut: find an element by its id
function $(id) {
  return document.getElementById(id);
}

// Fetch a URL and return the JSON. "no-store" makes sure we never get a cached answer.
async function getJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Request failed with status " + response.status);
  }
  return response.json();
}

// ---------- 1. Show server info ----------

async function loadInfo() {
  try {
    const info = await getJson("/api/info");
    $("hostname").textContent = info.hostname;
    $("environment").textContent = info.environment;
    $("version").textContent = info.version;
  } catch (error) {
    $("hostname").textContent = "Could not reach the server";
    $("environment").textContent = "-";
    $("version").textContent = "-";
  }
}

// ---------- 2. Health check ----------

function setHealth(isOk) {
  $("health-dot").className = "dot " + (isOk ? "ok" : "bad");
  $("health-text").textContent = isOk ? "Healthy" : "Not responding";
}

async function checkHealth() {
  try {
    const result = await getJson("/health");
    setHealth(result.status === "ok");
  } catch (error) {
    setHealth(false);
  }
}

// ---------- 3. Load balancing test ----------

// tally looks like: { "flask-demo-abc12": 6, "flask-demo-xyz98": 4 }
// It counts how many requests each pod answered.
let tally = {};
let totalSent = 0;

// Draw one bar per pod. The longest bar is the pod that answered the most requests.
function renderTally() {
  const box = $("tally");
  box.textContent = "";  // clear the old bars

  const names = Object.keys(tally).sort();
  const highest = Math.max(1, ...Object.values(tally));

  for (const name of names) {
    const count = tally[name];

    const row = document.createElement("div");
    row.className = "tally-row";

    const label = document.createElement("span");
    label.className = "tally-name";
    label.textContent = name;
    label.title = name;

    const track = document.createElement("div");
    track.className = "tally-track";
    const bar = document.createElement("div");
    bar.className = "tally-bar";
    bar.style.width = (count / highest) * 100 + "%";
    track.appendChild(bar);

    const number = document.createElement("span");
    number.className = "tally-count";
    number.textContent = count;

    row.append(label, track, number);
    box.appendChild(row);
  }

  const podCount = names.length;
  $("tally-note").textContent = totalSent === 0
    ? ""
    : totalSent + " requests answered by " + podCount + (podCount === 1 ? " pod." : " pods.");
}

// Send "count" requests one after another and add each answer to the tally.
async function sendRequests(count) {
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => { button.disabled = true; });  // stop double clicks

  for (let i = 0; i < count; i++) {
    try {
      const info = await getJson("/api/info");
      tally[info.hostname] = (tally[info.hostname] || 0) + 1;
      totalSent += 1;
      renderTally();
    } catch (error) {
      $("tally-note").textContent = "A request failed. Is the app still running?";
      break;
    }
  }

  buttons.forEach((button) => { button.disabled = false; });
}

function resetTally() {
  tally = {};
  totalSent = 0;
  renderTally();
}

// ---------- Start everything when the page loads ----------

$("send-10").addEventListener("click", () => sendRequests(10));
$("send-30").addEventListener("click", () => sendRequests(30));
$("reset").addEventListener("click", resetTally);

loadInfo();
checkHealth();
setInterval(checkHealth, 10000);  // repeat the health check every 10 seconds
