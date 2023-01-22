let response;
let start = 0;
let TSXData;
let aequitasData;
let alphaData;
var dots = [];
let startTime;
let currentTime;
let duration = 240; // duration in seconds
let realprice;
let price;
let volume;
let stonk;
let prices = new Map();
let stonks = new Map();
let clock;
let paused = false;
let myFont;

function preload() {
  myFont = loadFont("Roboto-Regular.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(myFont);
  startTime = millis();
  clock = createP("");
  clock.position(width / 2 - 78, 24);
  clock.style("font-size", "32px");
  clock.style("color", "white");
  setInterval(updateclock, 1000);
  let button = createButton("Pause");
  button.position(width / 2 - 20, 100);
  button.mousePressed(() => {
    paused = !paused;
  });
  let dataDisplay = createDiv("");
  dataDisplay.style("position", "absolute");
  dataDisplay.style("font-size", "20px");
  dataDisplay.style("color", "white");

  const ws = new WebSocket("ws://localhost:443");

  ws.addEventListener("open", () => ws.send("start"));

  ws.addEventListener("message", ({ data }) => {
    fill(0, 255, 0);
    if (JSON.parse(data).type == "message") {
      stonk = JSON.parse(data).data["symbol"];
      price = JSON.parse(data).data["price"];
      if (!prices.has(stonk)) {
        prices.set(stonk, price);
      }
      prices.set(stonk, prices.get(stonk) + price);
    } else if (JSON.parse(data).type == "volume") {
      if (JSON.parse(data).data != {}) {
        for (stonk of Object.keys(JSON.parse(data).data)) {
          stonks.set(stonk, JSON.parse(data).data[stonk]);
        }
        dotMaker();
      }
    }

    // handle changes in data
  });
}
function updateclock() {
  clock.html(floor(Date.now() / 1000));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  if (!paused) {
    background(31, 31, 31);
    // draw the progress bar
    currentTime = millis();
    let elapsedTime = currentTime - startTime;
    let percentageComplete =
      ((elapsedTime / (duration * 1000)) * width * 1) / 3;
    strokeWeight(3);
    stroke(217, 217, 217);
    fill(217, 217, 217);
    rect(width / 3, 20, (width * 1) / 3, 20, 10);
    strokeWeight(0);
    rect(0, 0, percentageComplete, 20);

    // update the drawn data
    for (let i = 0; i < dots.length; i++) {
      let transparency = (dots[i].timer / 40) * 255;
      const rgb = stringToRGB(dots[i].symbol);
      // text("symb", dots[i].x, dots[i].y);
      drawingContext.shadowBlur = 100;
      drawingContext.shadowColor = color(rgb.r, rgb.g, rgb.b);
      drawingContext.shadowWeight = 500;
      stroke(rgb.r + 150, rgb.g + 150, rgb.b + 150, transparency);
      strokeWeight(dots[i].strokeWeight);
      point(dots[i].x, dots[i].y);
      if (dots[i].timer <= 1) {
        dots.splice(i, 1);
      } else {
        dots[i].timer -= 1;
      }
    }
  }
}
function dotMaker() {
  if (prices.size == 0 || stonks.size == 0) {
    return;
  }
  let strokeWeight = 0;
  for (stonk of stonks) {
    let realprice = prices.get(stonk[0]) / stonk[1];
    let volume = stonk[1];
    var dot = {
      x: random(width),
      y: random(0, height - 20),
      timer: realprice * 10 * 2,
      strokeWeight: volume * 5,
      symbol: stonk[0],
      data:
        "symbol: " +
        stonk[0] +
        " at price: " +
        realprice +
        " at volume: " +
        volume,
    };
    dots.push(dot);
  }
  prices.clear();
  stonks.clear();
}
