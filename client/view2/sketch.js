const dots = {};
let currentAnomalyTresh = 1000000;
let currTimestamp = Date.now();

function setup() {
  createCanvas(windowWidth, windowHeight);
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = "white";
  drawingContext.shadowWeight = 100;

  const ws = new WebSocket("ws://localhost:8080");
  ws.addEventListener("open", () => ws.send("start"));
  ws.onmessage = ({ data: response }) => {
    const { type, data } = JSON.parse(response);

    if (type === "message") {
      const { symbol, price, timestamp } = data;
      if (!dots[symbol]) {
        dots[symbol] = new Dot(symbol);
      }
      dots[symbol].price = price;
      currTimestamp = timestamp;
    }

    if (type === "volume") {
      for (const [symbol, volume] of Object.entries(data)) {
        if (!dots[symbol]) {
          dots[symbol] = new Dot();
          dots[symbol].price = 0;
        }
        dots[symbol].targetVolume = volume;
      }
    }

    if (type === "anomaly") {
      currentAnomalyTresh = data;
    }
  };
}

function draw() {
  background(0);

  // Server clock
  textSize(30);
  fill(0, 255, 0);
  text(currTimestamp, 30, 30);
  textSize(10);

  for (const dot of Object.values(dots)) {
    dot.update();
    noStroke();
    dot.draw();

    // Anomalies
    if (dot.targetVolume > currentAnomalyTresh) {
      fill(0, 255, 0);
      ellipse(dot.x, dot.y, dot.currentVolume + 10);
    }

    // Mouse hover
    const distance = dist(dot.x, dot.y, mouseX, mouseY);
    if (distance < dot.currentVolume) {
      fill(0, 0, 255);
      ellipse(dot.x, dot.y, dot.currentVolume + 10);
      fill(255, 0, 0);
      text(`Symbol: ${dot.symbol}`, dot.x, dot.y);
      text(`Volume: ${dot.targetVolume}`, dot.x, dot.y + 20);
      text(`Price: ${dot.price}`, dot.x, dot.y + 30);
    }

    // Important data points
    if (dot.currentVolume > 30) {
      fill(255, 0, 0);
      text(dot.symbol, dot.x, dot.y);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
