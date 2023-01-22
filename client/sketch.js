let response;
let start = 0;
let TSXData;
let aequitasData;
let alphaData;
var dots = [];

function preload() {
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  const ws = new WebSocket('ws://localhost:443');

  ws.addEventListener("open", () => ws.send("start"));

  ws.addEventListener("message", ({ data }) => {
    console.log(data);
    // handle changes in data
  });
  
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  
  background(31, 31, 31);
  // update the drawn data
  for (let i = 0; i < dots.length; i++) {
    let transparency = (dots[i].timer/40)*255;
    stroke(217, 217, 217, transparency);
    // dots[i].timer -= 1;
    strokeWeight(dots[i].strokeWeight);
    // console.log(dots[i].timer + " " + dots[i].strokeWeight);
    point(dots[i].x, dots[i].y);
    if (dots[i].timer <= 1) {
      dots.splice(i, 1);
    }
    else{
      dots[i].timer -= 1;
    }
  }
  console.log(dots.length);
  // background(255);
}

function dotMaker(data) {
  var dot = {
    x: random(width),
    y: random(height),
    // timer: data["OrderPrice"] / 20,
    timer: Math.random() * 1000 * 6,
    // strokeWeight: (data["OrderPrice"]) / 15
    strokeWeight: Math.random() * 10
  }
  // console.log(dot.strokeWeight);
  // console.log(dot.timer);
  // console.log(dot.x);
  // console.log(dot.y);
  return dot;
}

function fakeStream(TSXData) {
  let fakeReturn = [];
  let randIndex = Math.floor(Math.random() * 10000);
  for (let i = randIndex; i < randIndex + 10; i++) {
    fakeReturn.push(TSXData[i]);
  }
  // console.log(fakeReturn);
  return fakeReturn;
}