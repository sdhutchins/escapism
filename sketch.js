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
let sharkFins = [];
let finRipples = [];
let sunClicked = false;

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
    sunsetBottom: [245, 169, 99]
};

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
    drawSun();
    drawSand();
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
    
    noStroke();
    fill(255, 255, 255, 200);
    
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

function createSharkFin(x, y) {
    const direction = x < width / 2 ? 1 : -1;
    sharkFins.push({
        x: x,
        y: y,
        direction: direction,
        speed: direction * 2,
        angle: 0,
        size: 30
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
        
        if (frameCount % 8 === 0) {
            createFinRipples(fin.x, fin.y);
        }
    }
    
    updateAndDrawFinRipples();
}

function drawSharkFin(x, y, direction, angle, size) {
    push();
    translate(x, y);
    rotate(sin(angle) * 0.1);
    
    noStroke();
    
    if (direction > 0) {
        fill(40, 50, 60);
        beginShape();
        vertex(0, size * 0.3);
        bezierVertex(size * 0.2, size * 0.1, size * 0.4, -size * 0.3, size * 0.5, -size * 0.7);
        bezierVertex(size * 0.6, -size * 0.8, size * 0.7, -size * 0.6, size * 0.8, -size * 0.4);
        bezierVertex(size * 0.9, -size * 0.2, size * 0.95, 0, size * 0.7, size * 0.2);
        bezierVertex(size * 0.5, size * 0.3, size * 0.3, size * 0.35, 0, size * 0.3);
        endShape(CLOSE);
        
        fill(60, 70, 80);
        beginShape();
        vertex(0, size * 0.3);
        bezierVertex(size * 0.15, size * 0.15, size * 0.35, -size * 0.2, size * 0.5, -size * 0.6);
        bezierVertex(size * 0.55, -size * 0.7, size * 0.6, -size * 0.5, size * 0.65, -size * 0.3);
        bezierVertex(size * 0.7, -size * 0.1, size * 0.65, 0.1, size * 0.5, size * 0.25);
        bezierVertex(size * 0.35, size * 0.3, size * 0.2, size * 0.32, 0, size * 0.3);
        endShape(CLOSE);
    } else {
        fill(40, 50, 60);
        beginShape();
        vertex(0, size * 0.3);
        bezierVertex(-size * 0.2, size * 0.1, -size * 0.4, -size * 0.3, -size * 0.5, -size * 0.7);
        bezierVertex(-size * 0.6, -size * 0.8, -size * 0.7, -size * 0.6, -size * 0.8, -size * 0.4);
        bezierVertex(-size * 0.9, -size * 0.2, -size * 0.95, 0, -size * 0.7, size * 0.2);
        bezierVertex(-size * 0.5, size * 0.3, -size * 0.3, size * 0.35, 0, size * 0.3);
        endShape(CLOSE);
        
        fill(60, 70, 80);
        beginShape();
        vertex(0, size * 0.3);
        bezierVertex(-size * 0.15, size * 0.15, -size * 0.35, -size * 0.2, -size * 0.5, -size * 0.6);
        bezierVertex(-size * 0.55, -size * 0.7, -size * 0.6, -size * 0.5, -size * 0.65, -size * 0.3);
        bezierVertex(-size * 0.7, -size * 0.1, -size * 0.65, 0.1, -size * 0.5, size * 0.25);
        bezierVertex(-size * 0.35, size * 0.3, -size * 0.2, size * 0.32, 0, size * 0.3);
        endShape(CLOSE);
    }
    
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
    
    push();
    translate(sunX, sunY);
    rotate(frameCount * 0.01);
    
    noStroke();
    
    for (let i = 0; i < numRays; i++) {
        const angle = (TWO_PI / numRays) * i;
        const x1 = cos(angle) * (sunSize / 2 + 10);
        const y1 = sin(angle) * (sunSize / 2 + 10);
        const x2 = cos(angle) * (sunSize / 2 + rayLength);
        const y2 = sin(angle) * (sunSize / 2 + rayLength);
        
        stroke(colorPalette.sunRays[0], colorPalette.sunRays[1], colorPalette.sunRays[2], 200);
        strokeWeight(4);
        line(x1, y1, x2, y2);
    }
    
    fill(colorPalette.sun[0], colorPalette.sun[1], colorPalette.sun[2]);
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
    
    noStroke();
    
    for (let i = 0; i < 5; i++) {
        const waveOffset = sin(time + i * 0.5) * (8 + i * 2);
        const waveSpeed = 1 + i * 0.3;
        const yPos = horizonY + 20 + i * 15;
        const waveHeight = 100 - i * 15;
        const alpha = 200 - i * 30;
        
        if (i === 0) {
            fill(colorPalette.waterLight[0], colorPalette.waterLight[1], colorPalette.waterLight[2], alpha);
        } else if (i === 1) {
            fill(colorPalette.waterMid[0], colorPalette.waterMid[1], colorPalette.waterMid[2], alpha);
        } else {
            fill(colorPalette.waterDark[0], colorPalette.waterDark[1], colorPalette.waterDark[2], alpha);
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
    fill(colorPalette.waterLight[0], colorPalette.waterLight[1], colorPalette.waterLight[2], 180);
    ellipse(width * 0.5, horizonY + 50 + sin(time) * 5, width * 1.4, 130);
    
    fill(colorPalette.waterMid[0], colorPalette.waterMid[1], colorPalette.waterMid[2], 160);
    ellipse(width * 0.5, horizonY + 30 + sin(time * 0.8) * 4, width * 1.2, 110);
    
    fill(colorPalette.waterDark[0], colorPalette.waterDark[1], colorPalette.waterDark[2], 140);
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
    for (let i = 0; i < 3; i++) {
        finRipples.push({
            x: finX,
            y: finY,
            radius: 10 + i * 8,
            growthSpeed: 1.5,
            opacity: 150 - i * 30,
            fadeSpeed: 1.2
        });
    }
}

function updateAndDrawFinRipples() {
    for (let i = finRipples.length - 1; i >= 0; i--) {
        const ripple = finRipples[i];
        ripple.radius += ripple.growthSpeed;
        ripple.opacity -= ripple.fadeSpeed;
        
        if (ripple.opacity <= 0 || ripple.radius > 80) {
            finRipples.splice(i, 1);
            continue;
        }
        
        noFill();
        stroke(255, 255, 255, ripple.opacity);
        strokeWeight(1.5);
        arc(ripple.x, ripple.y, ripple.radius, ripple.radius, 0, PI);
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

function mousePressed() {
    const clickedSun = checkSunClick(mouseX, mouseY);
    const clickedCloud = checkCloudClick(mouseX, mouseY);
    const clickedWater = checkWaterClick(mouseX, mouseY);
    
    if (clickedSun) {
        sunClicked = !sunClicked;
    } else if (clickedCloud) {
        startRain(clickedCloud.x, clickedCloud.y);
    } else if (clickedWater) {
        createSharkFin(mouseX, mouseY);
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
            createRipple(mouseX, mouseY);
            lastMouseX = mouseX;
            lastMouseY = mouseY;
        }
    }
}

function mouseReleased() {
    isDragging = false;
}

function touchStarted() {
    const clickedSun = checkSunClick(mouseX, mouseY);
    const clickedCloud = checkCloudClick(mouseX, mouseY);
    const clickedWater = checkWaterClick(mouseX, mouseY);
    
    if (clickedSun) {
        sunClicked = !sunClicked;
    } else if (clickedCloud) {
        startRain(clickedCloud.x, clickedCloud.y);
    } else if (clickedWater) {
        createSharkFin(mouseX, mouseY);
    } else {
        createRipple(mouseX, mouseY);
    }
    return false;
}

function touchMoved() {
    const distance = dist(mouseX, mouseY, lastMouseX, lastMouseY);
    if (distance > 8) {
        createRipple(mouseX, mouseY);
        lastMouseX = mouseX;
        lastMouseY = mouseY;
    }
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
}
