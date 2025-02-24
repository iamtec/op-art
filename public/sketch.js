let reverb;
let myLoop;
function preload() {
    robotoFont = loadFont('assets/fonts/Roboto/Roboto.ttf', () => {
 
    }); // Adjust the path as needed
    myLoop = loadSound('assets/sound1.mp3');
    myLoop2 = loadSound('assets/sound2.mp3');
    myLoop3 = loadSound('assets/sound3.mp3');
  }
////////////////
let displayChar = 'A'; // Main character to display
let currentShape = "line"; // Marker shape: "line", "triangle", "square", or "circle"

// Global variables for dynamic font size and spacing.
let fontSize = 32;
let gridSpacing = 50;

// Variables for drag adjustments.
let dragStartX, dragStartY;
let initialFontSize, initialSpacing;

let canvas;
let staticNoise; // For brown noise (radio static)
let soundStarted = false; // Flag to indicate if the sound has been started

function setup() {
  // Create a canvas 200px larger than the visible window.
  canvas = createCanvas(windowWidth + 200, windowHeight + 200);
  // Position the canvas so that the visible area is centered.
  canvas.position(-100, -100);
  textAlign(CENTER, CENTER);
  noStroke();
  
  reverb = new p5.Reverb();
  // The parameters here are (source, decayTime in seconds, wetLevel)
  // Adjust these values as needed for your desired effect.
  reverb.process(myLoop, 4, 4, true);
  // Set the dry/wet mix to 0.8 (80% wet, 20% dry) for a strong reverb effect.
  reverb.drywet(1);
  console.log(reverb);
  
  myLoop.output.gain.value = 0;
  
  // Initialize Brown Noise.
  staticNoise = new p5.Noise('brown');
  staticNoise.start();
  staticNoise.amp(0); // Start muted.
}

function draw() {
  // --- Draw Background Gradient ---
  for (let i = 0; i < height; i++) {
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(color("#0C1D3B"), color("#000000"), inter);
    stroke(c);
    line(0, i, width, i);
  }
  
  // --- Update Radio Static Volume (only if sound has started) ---
  if (soundStarted) {
    // Use a slow sine modulation to evoke a gentle ocean-like swell.
    let targetVol = map(sin(frameCount * 0.0015), -1, 1, 0.02, 0.08);
    staticNoise.amp(targetVol, 1);
  }
  
  // Determine the center of the visible area.
  let centerX = windowWidth / 2 + 100;
  let centerY = windowHeight / 2 + 100;
  
  push();
  translate(centerX, centerY);
  
  // Adjust mouse coordinates relative to center.
  let adjustedMouseX = mouseX - centerX;
  let adjustedMouseY = mouseY - centerY;
  
  let amplitude = 20;
  let frequency = 0.01;
  
  // Define grid boundaries relative to the center.
  let xStart = -windowWidth / 2 - 100 + gridSpacing / 2;
  let xEnd = windowWidth / 2 + 100;
  let yStart = -windowHeight / 2 - 100 + gridSpacing / 2;
  let yEnd = windowHeight / 2 + 100;
  
  // --- First Pass: Draw Marker Shapes (Background) ---
  for (let x = xStart; x < xEnd; x += gridSpacing) {
    for (let y = yStart; y < yEnd; y += gridSpacing) {
      
      let offsetX = sin((x + adjustedMouseX) * frequency) * amplitude;
      let offsetY = cos((y + adjustedMouseY) * frequency) * amplitude;
      let letterX = x + offsetX;
      let letterY = y + offsetY;
      
      let d = dist(letterX, letterY, adjustedMouseX, adjustedMouseY);
      let markerSize = map(d, 0, 200, 10, 20, true);
      
      let lineAngle = atan2(adjustedMouseY - letterY, adjustedMouseX - letterX);
      
      // --- Subtle Color Variation for Marker (Green) ---
      let nLine = noise(x * 0.1, y * 0.1);
      let baseLineColor = color("#1B7A37");
      let altLineColor = color("#248A41");
      let finalMarkerColor = lerpColor(baseLineColor, altLineColor, nLine);
      
      // Add subtle jitter to marker position.
      let markerJitterX = map(noise(x + 200, y + 200, frameCount * 0.02), 0, 1, -1.5, 1.5);
      let markerJitterY = map(noise(x + 300, y + 300, frameCount * 0.02), 0, 1, -1.5, 1.5);
      
      push();
      translate(letterX + markerJitterX, letterY + markerJitterY);
      rotate(lineAngle);
      stroke(finalMarkerColor);
      strokeWeight(2);
      noFill();
      
      switch (currentShape) {
        case "line":
          line(0, 0, markerSize, 0);
          break;
        case "triangle":
          noStroke();
          fill(finalMarkerColor);
          let triSize = markerSize * 0.6;
          triangle(0, -triSize/2, 0, triSize/2, triSize, 0);
          break;
        case "square":
          noStroke();
          fill(finalMarkerColor);
          let sqSize = markerSize * 0.6;
          rectMode(CORNER);
          rect(0, -sqSize/2, sqSize, sqSize);
          break;
        case "circle":
          noStroke();
          fill(finalMarkerColor);
          let circSize = markerSize * 0.6;
          ellipse(circSize/2, 0, circSize, circSize);
          break;
      }
      pop();
    }
  }
  
  // --- Second Pass: Draw Main Characters (Foreground) ---
  for (let x = xStart; x < xEnd; x += gridSpacing) {
    for (let y = yStart; y < yEnd; y += gridSpacing) {
      
      let offsetX = sin((x + adjustedMouseX) * frequency) * amplitude;
      let offsetY = cos((y + adjustedMouseY) * frequency) * amplitude;
      let letterX = x + offsetX;
      let letterY = y + offsetY;
      
      let d = dist(letterX, letterY, adjustedMouseX, adjustedMouseY);
      let weight = floor(map(d, 0, 200, 900, 100, true));
      
      // --- Subtle Color Variation for Text (Red) ---
      let nText = noise((x + 100) * 0.1, (y + 100) * 0.1);
      let baseTextColor = color("#DF312E");
      let altTextColor = color("#FF6659");
      let finalTextColor = lerpColor(baseTextColor, altTextColor, nText);
      
      // Add subtle jitter to text position.
      let textJitterX = map(noise(x, y, frameCount * 0.03), 0, 1, -2, 2);
      let textJitterY = map(noise(x + 500, y + 500, frameCount * 0.03), 0, 1, -2, 2);
      
      drawingContext.font = `${weight} ${fontSize}px 'Roboto', sans-serif`;
      drawingContext.fillStyle = finalTextColor.toString();
      drawingContext.textAlign = "center";
      drawingContext.textBaseline = "middle";
      drawingContext.fillText(displayChar, letterX + textJitterX, letterY + textJitterY);
    }
  }
  
  pop();
  
  // --- Lo-Fi Interference Overlays ---
  // Scanlines.
  push();
  noStroke();
  for (let y = 0; y < height; y += 2) {
    fill(0, 10);
    rect(0, y, width, 1);
  }
  pop();
  
  // Random noise.
  push();
  noStroke();
  for (let i = 0; i < 30; i++) {
    let rx = random(width);
    let ry = random(height);
    fill(255, random(10, 30));
    rect(rx, ry, random(3, 8), random(1, 3));
  }
  pop();
}

function keyTyped() {
  // Start sound on keyTyped if not already started.
  if (!soundStarted) {
    if (getAudioContext().state !== 'running') {
      getAudioContext().resume();
    }
    // Gradually fade in the sound over 5 seconds.
    staticNoise.amp(0.08, 5);
    soundStarted = true;
  }
  if (!myLoop.isPlaying()) {
    // Resume the AudioContext if necessary.
    if (getAudioContext().state !== 'running') {
      getAudioContext().resume();
    }
    // Start looping the audio.
    myLoop.loop();
    // Gradually fade in the volume over 5 seconds.
    myLoop.setVolume(1.0, 5);
  }

  if (!myLoop2.isPlaying()) {
    myLoop2.output.gain.value = 0;
    myLoop2.loop();
    myLoop2.setVolume(.7, 5);
  }
  if (!myLoop3.isPlaying()) {
    myLoop3.output.gain.value = 0;
    myLoop3.loop();
    myLoop3.setVolume(1.0, 5);
  }
  displayChar = key;
  currentShape = random(["line", "triangle", "square", "circle"]);
}

function windowResized() {
  resizeCanvas(windowWidth + 200, windowHeight + 200);
  canvas.position(-100, -100);
}

function mousePressed() {
  // Resume AudioContext on user gesture.
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  if (!soundStarted) {
    staticNoise.amp(0.08, 5);
    soundStarted = true;
  }

  if (!myLoop.isPlaying()) {
    myLoop.output.gain.value = 0;
    myLoop.loop();
    myLoop.setVolume(1.0, 5);
  }
  if (!myLoop2.isPlaying()) {
    myLoop2.output.gain.value = 0;
    myLoop2.loop();
    myLoop2.setVolume(.7, 5);
  }
  if (!myLoop3.isPlaying()) {
    myLoop3.output.gain.value = 0;
    myLoop3.loop();
    myLoop3.setVolume(1.0, 5);
  }
  
  let centerX = windowWidth / 2 + 100;
  let centerY = windowHeight / 2 + 100;
  dragStartX = mouseX - centerX;
  dragStartY = mouseY - centerY;
  initialFontSize = fontSize;
  initialSpacing = gridSpacing;
}

function mouseDragged() {
  let centerX = windowWidth / 2 + 100;
  let centerY = windowHeight / 2 + 100;
  let currentAdjustedX = mouseX - centerX;
  let currentAdjustedY = mouseY - centerY;
  
  let dx = currentAdjustedX - dragStartX;
  let dy = currentAdjustedY - dragStartY;
  
  fontSize = max(10, initialFontSize + dy * 0.2);
  gridSpacing = max(10, initialSpacing + dx);
}
