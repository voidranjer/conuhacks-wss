/*
  TODO:
  - Add protection from infinite loop
  - Add protection from overlapping dots
  - Add protection from dots going out of the screen
*/

const easing = 0.05;
const coords = [];
const safeDistance = 1000;

class Dot {
  constructor(symbol) {
    this.price = 0;
    this.targetVolume = 0;
    this.prevVolume = 0;
    this.currentVolume = 0;
    this.symbol = symbol;

    this.x = random(width);
    this.y = random(0, height - 20);

    // NOTE: Add protection from infinite loop here
    while (this.isTooClose()) {
      this.x = random(width);
      this.y = random(0, height - 20);
    }
    coords.push([this.x, this.y]);
  }

  update() {
    // this.x = this.x + random(-1, 1);
    // this.y = this.y + random(-1, 1);
  }

  draw() {
    fill(this.price + 100);
    const smoothed = (this.targetVolume - this.currentVolume) * easing;
    this.currentVolume += smoothed;
    ellipse(this.x, this.y, this.currentVolume);
  }

  isTooClose() {
    for (const [x, y] of Object.entries(coords)) {
      const distance = dist(this.x, this.y, x, y);
      if (distance < safeDistance) {
        return true;
      }
    }
    return false;
  }
}
