let colors;
let angleOffset = 0;
let colorShift = 0;
let fadeAlpha = 255;
let targetColorShift = 0;
let colorLerpFactor = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colors = [
    color(255, 50, 0),
    color(0, 255, 100),
    color(0, 100, 255),
    color(255, 255, 0)
  ];
  textFont('Courier');
  textSize(80);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(0);
  let waveOffset = sin(angleOffset) * 50;
  
  // Smooth color transition
  colorLerpFactor = lerp(colorLerpFactor, 1, 0.02);
  colorShift = lerp(colorShift, targetColorShift, colorLerpFactor);
  
  // Unique Art Nouveau style wiggly background lines
  for (let y = 0; y < height; y += 20) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(colors[floor(colorShift) % colors.length], colors[(floor(colorShift) + 1) % colors.length], inter);
    stroke(c);
    noFill();
    beginShape();
    let lineOffset = random(0, TWO_PI); // Unique offset for each line
    for (let x = 0; x <= width; x += 40) { // Ensure full width coverage
      let yOffset = sin(x * 0.01 + angleOffset + lineOffset) * random(5, 15);
      vertex(x, y + yOffset);
    }
    endShape();
  }
  
  // Warped, melting, and fading repeating text
  for (let x = 0; x < width; x += 400) {
    for (let y = 0; y < height; y += 200) {
      push();
      translate(x + sin(angleOffset * 2 + x * 0.005) * 15, y + cos(angleOffset * 2 + y * 0.005) * 15);
      let yOffset = sin(angleOffset) * 20;
      let textSizeVariation = 100 + sin(angleOffset) * 10;
      fill(colors[floor(colorShift) % colors.length], fadeAlpha);
      textSize(textSizeVariation);
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = colors[floor(colorShift) % colors.length];
      text("ART TIME CLUB", 0, yOffset);
      pop();
    }
  }
  
  fadeAlpha = map(sin(angleOffset), -1, 1, 150, 255);
  angleOffset += 0.03;
}

function mouseMoved() {
  angleOffset += 0.1; // Reduce processing intensity
  targetColorShift = (targetColorShift + 1) % colors.length; // Smoothly transition color shift
  colorLerpFactor = 0; // Reset lerp factor for smoother fade
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
