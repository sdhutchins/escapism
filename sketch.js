let ripples = [];
let particles = [];
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let rainDroplets = [];
let rainActive = false;
let rainStartTime = 0;
let rainCloudX = 0;
let rainCloudY = 0;
const RAIN_DURATION = 5000;
let sandGrains = [];
let sandMarks = [];
let sharkFins = [];
let finRipples = [];
let sunClicked = false;
const MAX_SAND_MARKS = 280;
const TIDE_CYCLE_DURATION = 60000;
const TIDE_ADVANCE_PORTION = 0.42;
const TIDE_PEAK_PORTION = 0.18;

const colorPalette = {
    skyTop: [39, 169, 223],
    skyMid: [100, 195, 236],
    horizon: [164, 221, 249],
    sandTop: [240, 230, 213],
    sandBottom: [235, 228, 215],
    waterLight: [145, 215, 225],
    waterMid: [121, 195, 208],
    waterDark: [97, 175, 191],
    sun: [255, 200, 100],
    sunRays: [255, 180, 80],
    particle: [255, 255, 255],
    sunsetTop: [254, 184, 77],
    sunsetBottom: [245, 169, 99],
    sunsetSun: [242, 156, 92],
    sunsetSunRays: [233, 96, 52],
    sunsetCloud: [255, 216, 190],
    sunsetWaterLight: [118, 182, 201],
    sunsetWaterMid: [96, 156, 179],
    sunsetWaterDark: [73, 128, 152],
    foam: [210, 231, 238],
    wetSand: [214, 201, 183],
    boatHull: [122, 98, 83],
    boatMast: [153, 140, 126]
};

const sailColors = [
    [224, 104, 92],
    [240, 177, 88],
    [124, 171, 197],
    [166, 192, 139],
    [206, 160, 120]
];

let sailColorIndex = 0;

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');
    
    colorMode(RGB, 255);
    
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: random(width),
            y: random(height * 0.5),
            size: random(2, 4),
            speed: random(0.1, 0.3),
            opacity: random(30, 60)
        });
    }
    
    const horizonY = height * 0.65;
    const sandStartY = horizonY + 30;
    
    for (let i = 0; i < 200; i++) {
        sandGrains.push({
            x: random(width),
            y: random(sandStartY, height),
            size: random(1, 3),
            brightness: random(-15, 15),
            opacity: random(100, 200)
        });
    }
}

function draw() {
    drawBeachScene();
    drawClouds();
    drawWaves();
    drawSailboat();
    drawSun();
    drawSand();
    updateAndDrawTideWash();
    updateAndDrawSandMarks();
    updateAndDrawRain();
    updateAndDrawSharkFins();
    updateAndDrawParticles();
    updateAndDrawRipples();
    drawSandTexture();
}

function drawBeachScene() {
    const skyHeight = height * 0.6;
    const horizonY = height * 0.65;
    
    noStroke();
    
    if (sunClicked) {
        for (let i = 0; i < 60; i++) {
            const y1 = map(i, 0, 60, 0, skyHeight);
            const y2 = map(i + 1, 0, 60, 0, skyHeight);
            const inter = i / 60;
            const r = lerp(colorPalette.sunsetTop[0], colorPalette.sunsetBottom[0], inter);
            const g = lerp(colorPalette.sunsetTop[1], colorPalette.sunsetBottom[1], inter);
            const b = lerp(colorPalette.sunsetTop[2], colorPalette.sunsetBottom[2], inter);
            fill(r, g, b);
            rect(0, y1, width, y2 - y1);
        }
        
        for (let i = 0; i < 15; i++) {
            const y1 = map(i, 0, 15, skyHeight, horizonY);
            const inter = i / 15;
            const r = lerp(colorPalette.sunsetBottom[0], colorPalette.horizon[0], inter);
            const g = lerp(colorPalette.sunsetBottom[1], colorPalette.horizon[1], inter);
            const b = lerp(colorPalette.sunsetBottom[2], colorPalette.horizon[2], inter);
            fill(r, g, b);
            rect(0, y1, width, (horizonY - skyHeight) / 15);
        }
    } else {
        for (let i = 0; i < 60; i++) {
            const y1 = map(i, 0, 60, 0, skyHeight);
            const y2 = map(i + 1, 0, 60, 0, skyHeight);
            const inter = i / 60;
            const r = lerp(colorPalette.skyTop[0], colorPalette.skyMid[0], inter);
            const g = lerp(colorPalette.skyTop[1], colorPalette.skyMid[1], inter);
            const b = lerp(colorPalette.skyTop[2], colorPalette.skyMid[2], inter);
            fill(r, g, b);
            rect(0, y1, width, y2 - y1);
        }
        
        for (let i = 0; i < 15; i++) {
            const y1 = map(i, 0, 15, skyHeight, horizonY);
            const inter = i / 15;
            const r = lerp(colorPalette.skyMid[0], colorPalette.horizon[0], inter);
            const g = lerp(colorPalette.skyMid[1], colorPalette.horizon[1], inter);
            const b = lerp(colorPalette.skyMid[2], colorPalette.horizon[2], inter);
            fill(r, g, b);
            rect(0, y1, width, (horizonY - skyHeight) / 15);
        }
    }
}

function drawClouds() {
    const time = frameCount * 0.003;
    const activeCloudColor = sunClicked ? colorPalette.sunsetCloud : colorPalette.particle;
    
    noStroke();
    fill(activeCloudColor[0], activeCloudColor[1], activeCloudColor[2], 200);
    
    for (let i = 0; i < 4; i++) {
        const cloudX = (width * 0.2) + (i * width * 0.25) + sin(time + i * 0.5) * 15;
        const cloudY = height * 0.25 + i * 50;
        const cloudSize = 80 + i * 15;
        
        push();
        translate(cloudX, cloudY);
        
        ellipse(0, 0, cloudSize, cloudSize * 0.6);
        ellipse(cloudSize * 0.4, 0, cloudSize * 0.7, cloudSize * 0.5);
        ellipse(-cloudSize * 0.3, 0, cloudSize * 0.6, cloudSize * 0.5);
        ellipse(cloudSize * 0.2, -cloudSize * 0.15, cloudSize * 0.5, cloudSize * 0.4);
        ellipse(-cloudSize * 0.2, -cloudSize * 0.1, cloudSize * 0.5, cloudSize * 0.4);
        
        pop();
    }
}

function getCloudPositions() {
    const time = frameCount * 0.003;
    const clouds = [];
    
    for (let i = 0; i < 4; i++) {
        const cloudX = (width * 0.2) + (i * width * 0.25) + sin(time + i * 0.5) * 15;
        const cloudY = height * 0.25 + i * 50;
        const cloudSize = 80 + i * 15;
        
        clouds.push({
            x: cloudX,
            y: cloudY,
            size: cloudSize
        });
    }
    
    return clouds;
}

function checkCloudClick(mx, my) {
    const clouds = getCloudPositions();
    
    for (let cloud of clouds) {
        const distance = dist(mx, my, cloud.x, cloud.y);
        if (distance < cloud.size) {
            return { x: cloud.x, y: cloud.y };
        }
    }
    return null;
}

function startRain(cloudX, cloudY) {
    rainActive = true;
    rainStartTime = millis();
    rainCloudX = cloudX;
    rainCloudY = cloudY;
    rainDroplets = [];
}

function checkWaterClick(mx, my) {
    const horizonY = height * 0.65;
    return my >= horizonY && my < height * 0.75;
}

function checkSandClick(mx, my) {
    const horizonY = height * 0.65;
    return my >= horizonY + 20 && my <= height - 10;
}

function getSailboatState() {
    const horizonY = height * 0.65;
    const driftX = sin(frameCount * 0.0035) * width * 0.028;
    const boatX = width * 0.74 + driftX;
    const boatY = horizonY - 2 + sin(frameCount * 0.02) * 0.8;

    return {
        x: boatX,
        y: boatY,
        width: 86,
        height: 46
    };
}

function drawSailboat() {
    const sailboat = getSailboatState();
    const activeSailColor = sailColors[sailColorIndex];

    push();
    translate(sailboat.x, sailboat.y);

    noStroke();
    fill(84, 120, 140, 40);
    ellipse(0, 8, sailboat.width * 1.05, 10);

    fill(colorPalette.boatHull[0], colorPalette.boatHull[1], colorPalette.boatHull[2]);
    beginShape();
    vertex(-sailboat.width * 0.38, 0);
    vertex(sailboat.width * 0.32, 0);
    vertex(sailboat.width * 0.2, sailboat.height * 0.18);
    vertex(-sailboat.width * 0.3, sailboat.height * 0.18);
    endShape(CLOSE);

    stroke(colorPalette.boatMast[0], colorPalette.boatMast[1], colorPalette.boatMast[2]);
    strokeWeight(2.2);
    line(-3, 0, -3, -sailboat.height);

    noStroke();
    fill(activeSailColor[0], activeSailColor[1], activeSailColor[2], 225);
    triangle(
        -3,
        -sailboat.height + 3,
        -3,
        0,
        sailboat.width * 0.24,
        -sailboat.height * 0.55
    );

    pop();
}

function checkSailboatClick(mx, my) {
    const sailboat = getSailboatState();
    const hitWidth = sailboat.width * 0.75;
    const hitHeight = sailboat.height * 1.3;

    return (
        mx >= sailboat.x - hitWidth * 0.5 &&
        mx <= sailboat.x + hitWidth * 0.5 &&
        my >= sailboat.y - hitHeight &&
        my <= sailboat.y + hitHeight * 0.35
    );
}

function createSharkFin(x, y) {
    const direction = x < width / 2 ? 1 : -1;
    sharkFins.push({
        x: x,
        y: y + 8,
        direction: direction,
        speed: direction * 1.6,
        angle: 0,
        size: 26
    });
}

function updateAndDrawSharkFins() {
    for (let i = sharkFins.length - 1; i >= 0; i--) {
        const fin = sharkFins[i];
        fin.x += fin.speed;
        fin.angle += 0.05;
        
        if (fin.x < -50 || fin.x > width + 50) {
            sharkFins.splice(i, 1);
            continue;
        }
        
        drawSharkFin(fin.x, fin.y, fin.direction, fin.angle, fin.size);
        
        if (frameCount % 10 === 0) {
            createFinRipples(fin.x, fin.y);
        }
    }
    
    updateAndDrawFinRipples();
}

function drawSharkFin(x, y, direction, angle, size) {
    push();
    translate(x, y);
    rotate(sin(angle) * 0.05);

    noStroke();
    fill(28, 54, 76, 42);
    ellipse(direction * size * 0.28, size * 0.4, size * 1.85, size * 0.28);
    fill(28, 54, 76, 60);
    ellipse(direction * size * 0.08, size * 0.34, size * 0.92, size * 0.2);
    
    scale(direction, 1);

    fill(52, 60, 69);
    beginShape();
    vertex(-size * 0.46, size * 0.28);
    bezierVertex(
        -size * 0.24, size * 0.16,
        size * 0.02, -size * 0.62,
        size * 0.24, -size * 0.78
    );
    bezierVertex(
        size * 0.34, -size * 0.7,
        size * 0.42, -size * 0.22,
        size * 0.36, size * 0.06
    );
    bezierVertex(
        size * 0.26, size * 0.18,
        size * 0.04, size * 0.24,
        -size * 0.46, size * 0.28
    );
    endShape(CLOSE);

    fill(80, 90, 98, 130);
    beginShape();
    vertex(-size * 0.16, size * 0.14);
    bezierVertex(
        -size * 0.02, -size * 0.02,
        size * 0.1, -size * 0.42,
        size * 0.2, -size * 0.58
    );
    bezierVertex(
        size * 0.24, -size * 0.5,
        size * 0.26, -size * 0.18,
        size * 0.18, size * 0.06
    );
    bezierVertex(
        size * 0.08, size * 0.12,
        -size * 0.02, size * 0.14,
        -size * 0.16, size * 0.14
    );
    endShape(CLOSE);
    
    pop();
}

function updateAndDrawRain() {
    if (rainActive) {
        const elapsed = millis() - rainStartTime;
        
        if (elapsed < RAIN_DURATION) {
            if (frameCount % 2 === 0) {
                for (let i = 0; i < 3; i++) {
                    rainDroplets.push({
                        x: rainCloudX + random(-60, 60),
                        y: rainCloudY + 30,
                        speed: random(3, 6),
                        length: random(8, 15)
                    });
                }
            }
        } else {
            rainActive = false;
        }
    }
    
    stroke(173, 216, 230, 200);
    strokeWeight(2);
    
    for (let i = rainDroplets.length - 1; i >= 0; i--) {
        const droplet = rainDroplets[i];
        droplet.y += droplet.speed;
        
        if (droplet.y > height) {
            rainDroplets.splice(i, 1);
            continue;
        }
        
        line(droplet.x, droplet.y, droplet.x, droplet.y + droplet.length);
    }
}

function drawSun() {
    const sunX = 120;
    const sunY = 120;
    const sunSize = 80;
    const rayLength = 40;
    const numRays = 16;
    const activeSunColor = sunClicked ? colorPalette.sunsetSun : colorPalette.sun;
    const activeRayColor = sunClicked ? colorPalette.sunsetSunRays : colorPalette.sunRays;
    const rayRotationSpeed = sunClicked ? 0.004 : 0.01;
    
    push();
    translate(sunX, sunY);
    rotate(frameCount * rayRotationSpeed);
    
    noStroke();
    
    for (let i = 0; i < numRays; i++) {
        const angle = (TWO_PI / numRays) * i;
        const x1 = cos(angle) * (sunSize / 2 + 10);
        const y1 = sin(angle) * (sunSize / 2 + 10);
        const x2 = cos(angle) * (sunSize / 2 + rayLength);
        const y2 = sin(angle) * (sunSize / 2 + rayLength);
        
        stroke(activeRayColor[0], activeRayColor[1], activeRayColor[2], 200);
        strokeWeight(4);
        line(x1, y1, x2, y2);
    }
    
    fill(activeSunColor[0], activeSunColor[1], activeSunColor[2]);
    noStroke();
    ellipse(0, 0, sunSize, sunSize);
    
    pop();
}

function checkSunClick(mx, my) {
    const sunX = 120;
    const sunY = 120;
    const sunSize = 80;
    const distance = dist(mx, my, sunX, sunY);
    return distance < sunSize / 2 + 40;
}

function drawWaves() {
    const horizonY = height * 0.65;
    const time = frameCount * 0.02;
    const waterLight = sunClicked ? colorPalette.sunsetWaterLight : colorPalette.waterLight;
    const waterMid = sunClicked ? colorPalette.sunsetWaterMid : colorPalette.waterMid;
    const waterDark = sunClicked ? colorPalette.sunsetWaterDark : colorPalette.waterDark;
    
    noStroke();
    
    for (let i = 0; i < 5; i++) {
        const waveOffset = sin(time + i * 0.5) * (8 + i * 2);
        const waveSpeed = 1 + i * 0.3;
        const yPos = horizonY + 20 + i * 15;
        const waveHeight = 100 - i * 15;
        const alpha = 200 - i * 30;
        
        if (i === 0) {
            fill(waterLight[0], waterLight[1], waterLight[2], alpha);
        } else if (i === 1) {
            fill(waterMid[0], waterMid[1], waterMid[2], alpha);
        } else {
            fill(waterDark[0], waterDark[1], waterDark[2], alpha);
        }
        
        beginShape();
        for (let x = 0; x <= width; x += 5) {
            const waveY = yPos + sin((x * 0.01) + (time * waveSpeed)) * waveOffset;
            vertex(x, waveY);
        }
        vertex(width, height);
        vertex(0, height);
        endShape(CLOSE);
    }
    
    noStroke();
    fill(waterLight[0], waterLight[1], waterLight[2], 180);
    ellipse(width * 0.5, horizonY + 50 + sin(time) * 5, width * 1.4, 130);
    
    fill(waterMid[0], waterMid[1], waterMid[2], 160);
    ellipse(width * 0.5, horizonY + 30 + sin(time * 0.8) * 4, width * 1.2, 110);
    
    fill(waterDark[0], waterDark[1], waterDark[2], 140);
    ellipse(width * 0.5, horizonY + 15 + sin(time * 0.6) * 3, width * 1.0, 90);
}

function drawSand() {
    const horizonY = height * 0.65;
    
    noStroke();
    
    fill(colorPalette.sandTop[0], colorPalette.sandTop[1], colorPalette.sandTop[2]);
    ellipse(width * 0.5, height - 50, width * 2, height - horizonY + 100);
    
    fill(colorPalette.sandBottom[0], colorPalette.sandBottom[1], colorPalette.sandBottom[2]);
    ellipse(width * 0.5, height - 30, width * 1.8, height - horizonY + 80);
}

function updateAndDrawTideWash() {
    const horizonY = height * 0.65;
    const shorelineY = horizonY + 34;
    const tideProgress = (millis() % TIDE_CYCLE_DURATION) / TIDE_CYCLE_DURATION;
    const tideReach = getTideReach(tideProgress);
    const washFrontY = shorelineY + tideReach;
    const waterLight = sunClicked ? colorPalette.sunsetWaterLight : colorPalette.waterLight;
    const waterMid = sunClicked ? colorPalette.sunsetWaterMid : colorPalette.waterMid;

    softenSandMarksForTideWash(washFrontY);

    noStroke();
    fill(colorPalette.wetSand[0], colorPalette.wetSand[1], colorPalette.wetSand[2], 110);
    ellipse(width * 0.5, shorelineY + tideReach * 0.58, width * 1.8, tideReach * 1.35 + 28);

    fill(waterMid[0], waterMid[1], waterMid[2], 155);
    ellipse(
        width * 0.5,
        shorelineY + tideReach * 0.48 + sin(frameCount * 0.03) * 3,
        width * 1.55,
        tideReach * 1.1 + 34
    );

    fill(waterLight[0], waterLight[1], waterLight[2], 170);
    ellipse(
        width * 0.5,
        shorelineY + tideReach * 0.35 + sin(frameCount * 0.04) * 2,
        width * 1.42,
        tideReach * 0.82 + 22
    );

    noStroke();
    fill(colorPalette.foam[0], colorPalette.foam[1], colorPalette.foam[2], 120);
    beginShape();
    for (let x = -20; x <= width + 20; x += 12) {
        const outerFoamY = washFrontY + sin((x * 0.018) + frameCount * 0.045) * 5;
        curveVertex(x, outerFoamY);
    }
    for (let x = width + 20; x >= -20; x -= 12) {
        const innerFoamY = washFrontY - 14 + sin((x * 0.02) + frameCount * 0.04 + 0.8) * 4;
        curveVertex(x, innerFoamY);
    }
    endShape(CLOSE);

    fill(colorPalette.foam[0], colorPalette.foam[1], colorPalette.foam[2], 150);
    beginShape();
    for (let x = -20; x <= width + 20; x += 10) {
        const crestY = washFrontY + sin((x * 0.024) + frameCount * 0.05) * 4;
        curveVertex(x, crestY);
    }
    for (let x = width + 20; x >= -20; x -= 10) {
        const undersideY = washFrontY - 8 + sin((x * 0.021) + frameCount * 0.04 + 0.9) * 3;
        curveVertex(x, undersideY);
    }
    endShape(CLOSE);

    fill(colorPalette.foam[0], colorPalette.foam[1], colorPalette.foam[2], 80);
    beginShape();
    for (let x = -20; x <= width + 20; x += 14) {
        const trailingOuterY = washFrontY - 7 + sin((x * 0.02) + frameCount * 0.035 + 1.2) * 2.4;
        curveVertex(x, trailingOuterY);
    }
    for (let x = width + 20; x >= -20; x -= 14) {
        const trailingInnerY = washFrontY - 14 + sin((x * 0.018) + frameCount * 0.03 + 1.8) * 2;
        curveVertex(x, trailingInnerY);
    }
    endShape(CLOSE);
}

function getTideReach(tideProgress) {
    const maximumReach = height * 0.15;

    if (tideProgress < TIDE_ADVANCE_PORTION) {
        return easeInOutSine(tideProgress / TIDE_ADVANCE_PORTION) * maximumReach;
    }

    if (tideProgress < TIDE_ADVANCE_PORTION + TIDE_PEAK_PORTION) {
        return maximumReach;
    }

    const retreatProgress = (tideProgress - TIDE_ADVANCE_PORTION - TIDE_PEAK_PORTION) / (1 - TIDE_ADVANCE_PORTION - TIDE_PEAK_PORTION);
    return (1 - easeInOutSine(retreatProgress)) * maximumReach;
}

function easeInOutSine(value) {
    return -(cos(PI * value) - 1) / 2;
}

function drawSandTexture() {
    const horizonY = height * 0.65;
    const sandStartY = horizonY + 30;
    
    noStroke();
    
    for (let grain of sandGrains) {
        if (grain.y >= sandStartY && grain.y <= height) {
            const r = constrain(colorPalette.sandTop[0] + grain.brightness, 220, 250);
            const g = constrain(colorPalette.sandTop[1] + grain.brightness, 215, 245);
            const b = constrain(colorPalette.sandTop[2] + grain.brightness, 200, 230);
            
            fill(r, g, b, grain.opacity);
            circle(grain.x, grain.y, grain.size);
        }
    }
    
    for (let i = 0; i < 50; i++) {
        const x = random(width);
        const y = random(sandStartY, height - 10);
        const size = random(0.5, 2);
        const brightness = random(-10, 10);
        
        const r = constrain(colorPalette.sandTop[0] + brightness, 230, 250);
        const g = constrain(colorPalette.sandTop[1] + brightness, 225, 245);
        const b = constrain(colorPalette.sandTop[2] + brightness, 210, 235);
        
        fill(r, g, b, random(80, 150));
        circle(x, y, size);
    }
}

function updateAndDrawSandMarks() {
    for (let i = sandMarks.length - 1; i >= 0; i--) {
        const sandMark = sandMarks[i];
        sandMark.opacity -= sandMark.fadeSpeed;

        if (sandMark.opacity <= 0) {
            sandMarks.splice(i, 1);
            continue;
        }

        stroke(sandMark.red, sandMark.green, sandMark.blue, sandMark.opacity);
        strokeWeight(sandMark.width);
        strokeCap(ROUND);
        line(sandMark.x1, sandMark.y1, sandMark.x2, sandMark.y2);

        stroke(255, 244, 228, sandMark.opacity * 0.18);
        strokeWeight(max(1, sandMark.width * 0.32));
        line(
            sandMark.x1,
            sandMark.y1 - sandMark.highlightOffset,
            sandMark.x2,
            sandMark.y2 - sandMark.highlightOffset
        );
    }
}

function softenSandMarksForTideWash(washFrontY) {
    for (let i = sandMarks.length - 1; i >= 0; i--) {
        const sandMark = sandMarks[i];
        const markDepth = max(sandMark.y1, sandMark.y2);

        if (markDepth < washFrontY - 6) {
            sandMark.opacity -= sandMark.fadeSpeed * 4.5;
        } else if (markDepth < washFrontY + 20) {
            sandMark.opacity -= sandMark.fadeSpeed * 1.2;
        }
    }
}

function updateAndDrawParticles() {
    for (let particle of particles) {
        particle.y += particle.speed;
        
        if (particle.y > height * 0.6) {
            particle.y = -10;
            particle.x = random(width);
        }
        
        fill(colorPalette.particle[0], colorPalette.particle[1], colorPalette.particle[2], particle.opacity);
        noStroke();
        circle(particle.x, particle.y, particle.size);
    }
}

function createFinRipples(finX, finY) {
    if (finRipples.length > 60) {
        finRipples.shift();
    }

    finRipples.push({
        x: finX,
        y: finY + 6,
        width: random(18, 28),
        height: random(3, 6),
        driftX: random(-0.15, 0.15),
        driftY: random(0.04, 0.12),
        stretchSpeed: random(0.35, 0.55),
        fadeSpeed: random(2.4, 3.2),
        opacity: random(70, 110)
    });
}

function updateAndDrawFinRipples() {
    for (let i = finRipples.length - 1; i >= 0; i--) {
        const ripple = finRipples[i];
        ripple.x += ripple.driftX;
        ripple.y += ripple.driftY;
        ripple.width += ripple.stretchSpeed;
        ripple.height += 0.05;
        ripple.opacity -= ripple.fadeSpeed;
        
        if (ripple.opacity <= 0 || ripple.width > 56) {
            finRipples.splice(i, 1);
            continue;
        }
        
        noFill();
        stroke(236, 245, 248, ripple.opacity);
        strokeWeight(1.1);
        arc(ripple.x, ripple.y, ripple.width, ripple.height, PI + QUARTER_PI * 0.2, TWO_PI - QUARTER_PI * 0.2);
    }
}

function updateAndDrawRipples() {
    for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        ripple.radius += ripple.growthSpeed;
        ripple.opacity -= ripple.fadeSpeed;
        
        if (ripple.opacity <= 0) {
            ripples.splice(i, 1);
            continue;
        }
        
        noFill();
        stroke(255, 255, 255, ripple.opacity);
        strokeWeight(1.5);
        arc(ripple.x, ripple.y, ripple.radius, ripple.radius, 0, PI);
    }
}

function createSandMark(startX, startY, endX, endY) {
    if (!checkSandClick(endX, endY)) {
        return;
    }

    if (sandMarks.length >= MAX_SAND_MARKS) {
        sandMarks.shift();
    }

    sandMarks.push({
        x1: startX,
        y1: startY,
        x2: endX,
        y2: endY,
        width: random(5, 8),
        opacity: random(42, 60),
        fadeSpeed: random(0.08, 0.14),
        red: random(176, 188),
        green: random(162, 174),
        blue: random(145, 156),
        highlightOffset: random(1.5, 2.5)
    });
}

function mousePressed() {
    const clickedSailboat = checkSailboatClick(mouseX, mouseY);
    const clickedSun = checkSunClick(mouseX, mouseY);
    const clickedCloud = checkCloudClick(mouseX, mouseY);
    const clickedWater = checkWaterClick(mouseX, mouseY);
    const clickedSand = checkSandClick(mouseX, mouseY);
    
    if (clickedSailboat) {
        sailColorIndex = (sailColorIndex + 1) % sailColors.length;
    } else if (clickedSun) {
        sunClicked = !sunClicked;
    } else if (clickedCloud) {
        startRain(clickedCloud.x, clickedCloud.y);
    } else if (clickedWater) {
        createSharkFin(mouseX, mouseY);
    } else if (clickedSand) {
        isDragging = true;
        lastMouseX = mouseX;
        lastMouseY = mouseY;
    } else {
        isDragging = true;
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        createRipple(mouseX, mouseY);
    }
}

function mouseDragged() {
    if (isDragging) {
        const distance = dist(mouseX, mouseY, lastMouseX, lastMouseY);
        if (distance > 8) {
            if (checkSandClick(mouseX, mouseY) && checkSandClick(lastMouseX, lastMouseY)) {
                createSandMark(lastMouseX, lastMouseY, mouseX, mouseY);
            } else {
                createRipple(mouseX, mouseY);
            }
            lastMouseX = mouseX;
            lastMouseY = mouseY;
        }
    }
}

function mouseReleased() {
    isDragging = false;
}

function touchStarted() {
    const clickedSailboat = checkSailboatClick(mouseX, mouseY);
    const clickedSun = checkSunClick(mouseX, mouseY);
    const clickedCloud = checkCloudClick(mouseX, mouseY);
    const clickedWater = checkWaterClick(mouseX, mouseY);
    const clickedSand = checkSandClick(mouseX, mouseY);
    
    if (clickedSailboat) {
        sailColorIndex = (sailColorIndex + 1) % sailColors.length;
    } else if (clickedSun) {
        sunClicked = !sunClicked;
    } else if (clickedCloud) {
        startRain(clickedCloud.x, clickedCloud.y);
    } else if (clickedWater) {
        createSharkFin(mouseX, mouseY);
    } else if (clickedSand) {
        isDragging = true;
        lastMouseX = mouseX;
        lastMouseY = mouseY;
    } else {
        isDragging = true;
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        createRipple(mouseX, mouseY);
    }
    return false;
}

function touchMoved() {
    if (isDragging) {
        const distance = dist(mouseX, mouseY, lastMouseX, lastMouseY);
        if (distance > 8) {
            if (checkSandClick(mouseX, mouseY) && checkSandClick(lastMouseX, lastMouseY)) {
                createSandMark(lastMouseX, lastMouseY, mouseX, mouseY);
            } else {
                createRipple(mouseX, mouseY);
            }
            lastMouseX = mouseX;
            lastMouseY = mouseY;
        }
    }
    return false;
}

function touchEnded() {
    isDragging = false;
    return false;
}

function createRipple(x, y) {
    ripples.push({
        x: x,
        y: y,
        radius: 8,
        growthSpeed: 1.2,
        opacity: 120,
        fadeSpeed: 1.5
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    const horizonY = height * 0.65;
    const sandStartY = horizonY + 30;
    sandGrains = [];
    
    for (let i = 0; i < 200; i++) {
        sandGrains.push({
            x: random(width),
            y: random(sandStartY, height),
            size: random(1, 3),
            brightness: random(-15, 15),
            opacity: random(100, 200)
        });
    }

    sandMarks = sandMarks.filter((sandMark) => (
        sandMark.x1 <= width &&
        sandMark.x2 <= width &&
        sandMark.y1 <= height &&
        sandMark.y2 <= height
    ));
}
