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
let percentageComplete;
var pausedDots = [];

function preload() {
  myFont = loadFont("Roboto-Regular.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(myFont);
  startTime = millis();
  clock = createP("");
  clock.position(width / 2 - 24, 28);
  clock.style("font-size", "18px");
  clock.style("color", "white");
  clock.style("font-family", "Roboto-Regular")
  setInterval(updateclock, 1000);
  let button = createButton("Pause");
  button.position(width / 2 - 20, 70);
  button.mousePressed(() => {
    paused = !paused;
  });
  let dataDisplay = createDiv("");
  dataDisplay.style("position", "absolute");
  dataDisplay.style("font-size", "20px");
  dataDisplay.style("color", "white");

  const ws = new WebSocket("ws://localhost:8080");

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
  const today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);
  clock.html(h + ":" + m + ":" + s);
  setTimeout(startTime, 1000);
}

function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
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
    if (elapsedTime > duration * 1000) {
      percentageComplete = width * 1 / 3;
    } else {
      percentageComplete = elapsedTime / (duration * 1000) * width * 1 / 3;
    }
    strokeWeight(3);
    stroke(217, 217, 217);
    fill(217, 217, 217);
    drawingContext.shadowBlur = 0;
    rect(width / 3, 20, (width * 1) / 3, 20, 10);
    // let percentageComplete = (elapsedTime / (duration * 1000)) * width;
    strokeWeight(0);
    fill(52, 62, 89);
    rect(width/3, 20, percentageComplete + 20, 20, 20);

    // update the drawn data
    for (let i = 0; i < dots.length; i++) {
      strokeWeight(0);
      let transparency = ((dots[i].timer / 40) * 255) * (dots[i].strokeWeight / 15);
      const rgb = stringToRGB(dots[i].symbol);
      // text("symb", dots[i].x, dots[i].y);
      let x = dots[i].x;
      let y = dots[i].y;
      const radius = dots[i].strokeWeight;
      const FACTOR = 200;
      fill(rgb.r + FACTOR, rgb.g + FACTOR, rgb.b + FACTOR, transparency);
      ellipse(x, y, radius, radius);
      let d = dist(mouseX, mouseY, x, y);
      if (d < radius) {
        drawingContext.shadowBlur = 100;
        drawingContext.shadowColor = "white";
        drawingContext.shadowWeight = 500;
        stroke(255, 255, 255);
        strokeWeight(2);
        circle(x, y, radius + 2);
        drawingContext.shadowBlur = 0;
        fill(255, 255, 255);
        strokeWeight(0);
        textSize(10);
        // box under the text
        fill(0, 0, 0, 60);
        rect(x + radius / 1.5, y - radius / 1.5 - 10, 50, 35);
        fill(255, 255, 255);
        text(dots[i].data, x + radius / 1.5, y - radius / 1.5);
      }
      if (dots[i].timer <= 1) {
        dots.splice(i, 1);
      } else {
        dots[i].timer -= 1;
      }
    }

    // connect the largest dots with lines
    let largest = [];
    for (let i = 0; i < dots.length; i++) {
      if (largest.length < 5) {
        largest.push(dots[i]);
      } else {
        for (let j = 0; j < largest.length; j++) {
          if (!largest.includes(dots[i]) && dots[i].strokeWeight > 15) {
            if(dots[i].strokeWeight > largest[j].strokeWeight) {
            largest.splice(j, 1);
            largest.push(dots[i]);
            }
          }
        }
      }
    }
    for (let i = 0; i < largest.length; i++) {
      for (let j = i + 1; j < largest.length; j++) {
        stroke(255, 255, 255, 80);
        strokeWeight(1);
        line(largest[i].x, largest[i].y, largest[j].x, largest[j].y);
      }
    }
    // clone the dots array
    pausedDots = dots.slice();
  } else {
    // update the drawn data
    for (let i = 0; i < pausedDots.length; i++) {
      strokeWeight(0);
      let transparency = (pausedDots[i].timer / 40) * 255;
      const rgb = stringToRGB(pausedDots[i].symbol);
      let x = pausedDots[i].x;
      let y = pausedDots[i].y;
      const radius = pausedDots[i].strokeWeight;
      const FACTOR = 200;
      fill(rgb.r + FACTOR, rgb.g + FACTOR, rgb.b + FACTOR, transparency);
      ellipse(x, y, radius, radius);
      let d = dist(mouseX, mouseY, x, y);
      if (d < radius) {
        drawingContext.shadowBlur = 100;
        drawingContext.shadowColor = "white";
        drawingContext.shadowWeight = 500;
        stroke(255, 255, 255);
        strokeWeight(2);
        circle(x, y, radius + 2);
        drawingContext.shadowBlur = 0;
        fill(255, 255, 255);
        strokeWeight(0);
        textSize(10);
        // box under the text
        fill(0, 0, 0, 60);
        rect(x + radius / 1.5, y - radius / 1.5 - 10, 50, 35);
        fill(255, 255, 255);
        text(pausedDots[i].data, x + radius / 1.5, y - radius / 1.5);
      }
    }
  }
}
function dotMaker() {
  if (prices.size == 0 || stonks.size == 0) {
    return;
  }
  for (stonk of stonks) {
    let realprice = prices.get(stonk[0]) / stonk[1];
    let volume = stonk[1];
    var dot = {
      x: random(0 + width/10, width - width/10),
      y: random(0 + height/7, height - height/10),
      timer: realprice * 10,
      strokeWeight: volume / 4,
      symbol: stonk[0],
      data:
        stonk[0] + 
        "\n$" +
        parseFloat(realprice).toFixed(2) +
        "\n" + 
        volume + " shares",
    };
    if (dot.strokeWeight > 15) {
      dot.strokeWeight = 15 + volume / 10;
    }
    // check overlap
    for (let i = 0; i < dots.length; i++) {
      let x = dots[i].x;
      let y = dots[i].y;
      let d = dist(dot.x, dot.y, x, y);
      while (d < dot.strokeWeight + dots[i].strokeWeight) {
        dot.x = random(0 + width/10, width - width/10);
        dot.y = random(0 + height/ 10, height - height/10);
        i = -1;
      }
    }
    dots.push(dot);
  }
  prices.clear();
  stonks.clear();
}
