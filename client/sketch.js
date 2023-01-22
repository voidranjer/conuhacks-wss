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



function preload() {
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  startTime = millis();
  clock = createP("");
  clock.position(0, 0);
  clock.style("font-size", "32px");
  clock.style("color", "white");
  setInterval(updateclock, 1000);
  const ws = new WebSocket('ws://localhost:443');

  ws.addEventListener("open", () => ws.send("start"));

  ws.addEventListener("message", ({ data }) => {
    fill(0,255,0);
    if (JSON.parse(data).type == "message"){
      stonk = JSON.parse(data).data["symbol"];
      price = JSON.parse(data).data["price"];
      if(!(prices.has(stonk))){
        prices.set(stonk, price);
      }
      prices.set(stonk, prices.get(stonk) + price); 
    }
    else if (JSON.parse(data).type == "volume"){
      if (JSON.parse(data).data != {}){
        for (stonk of Object.keys(JSON.parse(data).data)){
          stonks.set(stonk, JSON.parse(data).data[stonk]);
        }
        dotMaker();
    }
  }
    
    

    // handle changes in data
  });
  
}

function updateclock(){
  clock.html(floor(Date.now()/1000));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  console.log(dots);
  
  background(31, 31, 31);
  // draw the progress bar
  currentTime = millis();
  let elapsedTime = currentTime - startTime;
  let percentageComplete = (elapsedTime / (duration * 1000)) * width;
  strokeWeight(0);
  rect(0, 0, percentageComplete, 20);

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

function dotMaker() {
  if (prices.size == 0 || stonks.size == 0) {
    return;
  }
  let strokeWeight = 0;
  for (stonk of stonks){
    // console.log (prices.get(stonk[0]), prices.get(stonk[0]) / stonk[1]);
    let realprice = prices.get(stonk[0]) / stonk[1];
    let volume = stonk[1];
    var dot = {
      x: random(width),
      y: random(0,height-20),
      // timer: data["OrderPrice"] / 20,
      timer: realprice * 10 * 6,
      // strokeWeight: (data["OrderPrice"]) / 15
      strokeWeight: volume * 5
    }
    // console.log(dot.strokeWeight);
    // console.log(dot.timer);
    // console.log(dot.x);
    // console.log(dot.y);
    dots.push(dot);
  }
prices.clear();
stonks.clear();
}