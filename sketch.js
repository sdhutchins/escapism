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
let nightStars = [];
let shootingStars = [];
const MAX_SAND_MARKS = 280;
const TIDE_CYCLE_DURATION = 60000;
const TIDE_ADVANCE_PORTION = 0.42;
const TIDE_PEAK_PORTION = 0.18;
const MAX_SHOOTING_STARS = 6;
const sceneModes = ['day', 'sunset', 'night'];
const timeDialStops = [
    { value: 0, mode: 'day', label: 'Day' },
    { value: 0.5, mode: 'goldenHour', label: 'Golden hour' },
    { value: 1, mode: 'sunset', label: 'Orange-pink sunset' },
    { value: 1.5, mode: 'afterglow', label: 'Afterglow' },
    { value: 2, mode: 'night', label: 'Night' }
];
let sceneModeIndex = 0;
const timeDialConfig = {
    pixelsPerMood: 64,
    ticksPerMood: 2,
    settlingSeconds: 0.16,
    colorTransitionSeconds: 2.6,
    minimumTickInterval: 0.025,
    tickDuration: 0.006,
    tickDecay: 0.2,
    tickLowpassFrequency: 6500,
    tickHighpassFrequency: 1100,
    tickGain: 0.6
};
// State: the requested mood, its visible position, and one captured gesture.
const timeDialState = {
    target: 0,
    position: 0,
    scenePosition: 0,
    transitionFrom: 0,
    transitionTarget: 0,
    transitionElapsed: 0,
    pointerId: null,
    dragStartX: 0,
    dragStartValue: 0,
    lastTick: 0,
    audioContext: null,
    tickBuffer: null,
    isResumingAudio: false,
    hasPendingTick: false,
    lastTickTime: -Infinity
};
const reducedMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let timeDialElements = null;
const dayAudioPlaylist = [
    {
        title: 'Daydreaming',
        artist: 'NxWorries, Anderson .Paak, Knxwledge',
        filePath: 'assets/audio/NxWorries, Anderson .Paak, Knxwledge - Daydreaming.mp3'
    },
    {
        title: 'Put My Hands On You',
        artist: 'DEAN, Anderson .Paak',
        filePath: 'assets/audio/DEAN, Anderson .Paak - Put My Hands On You.mp3'
    },
    {
        title: 'Drowning In You',
        artist: 'Pascäal',
        filePath: 'assets/audio/Pascäal - Drowning In You.mp3'
    },
    {
        title: 'Why Don\'t We Fall in Love',
        artist: 'Amerie',
        filePath: 'assets/audio/Amerie - Why Don\'t We Fall in Love.mp3'
    },
    {
        title: 'Summer Girl',
        artist: 'Hush Forte, Q',
        filePath: 'assets/audio/Hush Forte, Q - Summer Girl.mp3'
    },
    {
        title: 'Precis Two',
        artist: 'Vansire, Ivy Sole',
        filePath: 'assets/audio/Vansire, Ivy Sole - Précis Two.mp3'
    },
    {
        title: 'Breathe Deeper',
        artist: 'Tame Impala',
        filePath: 'assets/audio/Tame Impala - Breathe Deeper.mp3'
    }
];
const nightAudioPlaylist = [
    {
        title: 'Midnight - Solo',
        artist: 'Lianne La Havas',
        filePath: 'assets/audio/Lianne La Havas - Midnight - Solo.mp3'
    },
    {
        title: 'Under The Moon',
        artist: 'Alex Isley, Jack Dine',
        filePath: 'assets/audio/Alex Isley, Jack Dine - Under The Moon.mp3'
    },
    {
        title: 'Crashing Down',
        artist: 'SiR',
        filePath: 'assets/audio/SiR - Crashing Down.mp3'
    }
];
const audioState = {
    activePlaylist: dayAudioPlaylist,
    currentTrackIndex: 0,
    currentAudio: null,
    isMuted: false,
    isPlaying: false,
    volume: 0.1,
    hasUnlockedAudio: false
};
let audioElements = null;

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
    sunsetTop: [219, 172, 150],
    sunsetBottom: [249, 157, 130],
    sunsetHorizon: [255, 139, 66],
    sunsetSun: [255, 234, 166],
    sunsetSunRays: [233, 96, 52],
    sunsetCloud: [223, 187, 163],
    sunsetCloudShadow: [165, 148, 139],
    sunsetCloudHighlight: [255, 187, 143],
    sunsetWaterLight: [153, 163, 166],
    sunsetWaterMid: [129, 145, 153],
    sunsetWaterDark: [106, 126, 140],
    sunsetSandTop: [202, 181, 158],
    sunsetSandBottom: [189, 170, 151],
    sunsetWetSand: [196, 165, 139],
    sunsetFoam: [200, 206, 205],
    nightTop: [17, 34, 74],
    nightMid: [35, 57, 103],
    nightHorizon: [84, 110, 153],
    nightCloud: [138, 155, 190],
    nightWaterLight: [72, 115, 155],
    nightWaterMid: [51, 87, 127],
    nightWaterDark: [31, 56, 92],
    nightSandTop: [180, 179, 191],
    nightSandBottom: [150, 152, 170],
    moon: [248, 243, 223],
    moonGlow: [198, 219, 255],
    star: [244, 247, 255],
    foam: [210, 231, 238],
    nightFoam: [181, 205, 226],
    wetSand: [214, 201, 183],
    nightWetSand: [122, 127, 146],
    boatHull: [122, 98, 83],
    boatMast: [153, 140, 126],
    nightBoatHull: [79, 79, 101],
    nightBoatMast: [122, 126, 155]
};

// Extra dial stops keep warm light and afterglow distinct during the gradual transition.
const twilightPalettes = {
    goldenHour: {
        skyTop: [221, 197, 161],
        skyMid: [250, 187, 132],
        horizon: [255, 178, 99],
        cloud: [244, 218, 183],
        waterLight: [157, 177, 182],
        waterMid: [130, 154, 164],
        waterDark: [110, 137, 153],
        sunBody: [255, 225, 163]
    },
    afterglow: {
        skyTop: [154, 157, 165],
        skyMid: [228, 166, 159],
        horizon: [251, 166, 125],
        cloud: [179, 158, 154],
        waterLight: [124, 144, 153],
        waterMid: [105, 126, 141],
        waterDark: [86, 108, 128],
        sandTop: [175, 164, 157],
        sandBottom: [165, 155, 150]
    }
};

const sailColors = [
    [224, 104, 92],
    [240, 177, 88],
    [124, 171, 197],
    [166, 192, 139],
    [206, 160, 120]
];

let sailColorIndex = 0;

const scenePalettes = timeDialStops.map((stop) => getSceneColors(stop.mode));
// Reuse the blended palette across all renderers instead of allocating it per draw call.
const blendedSceneColors = Object.fromEntries(
    Object.entries(scenePalettes[0]).map(([name, channels]) => [name, [...channels]])
);

initializeAudioPlayer();
initializeTimeDial();

function initializeTimeDial() {
    timeDialElements = {
        container: document.getElementById('time-dial'),
        input: document.getElementById('time-control')
    };
    const input = timeDialElements.input;
    const container = timeDialElements.container;
    if (!input || !container) return;

    // Unlock before target handlers run: the existing player unlocks sound on the first gesture.
    container.addEventListener('pointerdown', prepareDialSound, { capture: true });
    // Some mobile browsers grant audio permission only when the first touch ends.
    container.addEventListener('pointerup', prepareDialSound, { capture: true });
    container.addEventListener('touchend', prepareDialSound, { capture: true, passive: true });
    input.addEventListener('keydown', prepareDialSound, { capture: true });
    // Input: pointer capture keeps mouse and touch on the same bounded drag path.
    container.addEventListener('pointerdown', (event) => {
        if (!event.isPrimary || event.button !== 0 || timeDialState.pointerId !== null) return;
        event.preventDefault();
        input.focus({ preventScroll: true });
        container.setPointerCapture(event.pointerId);
        timeDialState.pointerId = event.pointerId;
        timeDialState.dragStartX = event.clientX;
        timeDialState.dragStartValue = timeDialState.target;
        unlockDialSound();
    });
    container.addEventListener('pointermove', (event) => {
        if (event.pointerId !== timeDialState.pointerId) return;
        const distance = timeDialState.dragStartX - event.clientX;
        setTimeDialValue(timeDialState.dragStartValue + distance / timeDialConfig.pixelsPerMood);
    });
    container.addEventListener('pointerup', finishTimeDialDrag);
    container.addEventListener('pointercancel', finishTimeDialDrag);
    container.addEventListener('lostpointercapture', finishTimeDialDrag);
    input.addEventListener('keydown', (event) => {
        const direction = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key];
        if (direction === undefined && event.key !== 'Home' && event.key !== 'End') return;
        event.preventDefault();
        unlockDialSound();
        const nextValue = event.key === 'Home' ? 0 : event.key === 'End' ? 2
            : timeDialState.target + direction / timeDialConfig.ticksPerMood;
        setTimeDialValue(nextValue);
        commitTimeDialMood();
    });
    // Native range input remains usable by assistive technology without pointer gestures.
    input.addEventListener('input', () => {
        unlockDialSound();
        setTimeDialValue(Number(input.value));
        commitTimeDialMood();
    });
}

function prepareDialSound() {
    if (!audioState.hasUnlockedAudio) unlockAudioOnInteraction();
    unlockDialSound();
}

function setTimeDialValue(value) {
    const tick = Math.max(0, Math.min(timeDialStops.length - 1,
        Math.round(value * timeDialConfig.ticksPerMood)));
    timeDialState.target = timeDialStops[tick].value;
    if (tick !== timeDialState.lastTick) playDialTick();
    timeDialState.lastTick = tick;
    timeDialElements.input.value = String(timeDialState.target);
    timeDialElements.input.setAttribute('aria-valuetext', timeDialStops[tick].label);
}

function finishTimeDialDrag(event) {
    if (event.pointerId !== timeDialState.pointerId) return;
    timeDialState.pointerId = null;
    commitTimeDialMood();
}

function commitTimeDialMood() {
    sceneModeIndex = Math.round(timeDialState.target);
    syncPlaylistToSceneMode();
}

// Update: smooth settling is time-based, so it feels consistent across frame rates.
function updateTimeDial() {
    const elapsedSeconds = Math.min(deltaTime / 1000, 0.05);
    const isDraggingDial = timeDialState.pointerId !== null;
    const dialBlend = reducedMotionPreference.matches || isDraggingDial ? 1
        : 1 - Math.exp(-elapsedSeconds / timeDialConfig.settlingSeconds);
    timeDialState.position += (timeDialState.target - timeDialState.position) * dialBlend;
    updateSceneTransition(deltaTime / 1000);
    if (timeDialElements.container) {
        timeDialElements.container.style.setProperty('--dial-offset',
            `${-timeDialState.position * timeDialConfig.pixelsPerMood}px`);
    }
    const palettePosition = timeDialState.scenePosition * timeDialConfig.ticksPerMood;
    const earlierMood = Math.min(Math.floor(palettePosition), scenePalettes.length - 2);
    const blend = palettePosition - earlierMood;
    for (const name of Object.keys(blendedSceneColors)) {
        for (let channel = 0; channel < 3; channel++) {
            const start = scenePalettes[earlierMood][name][channel];
            blendedSceneColors[name][channel] = start + (scenePalettes[earlierMood + 1][name][channel] - start) * blend;
        }
    }
}

function updateSceneTransition(elapsedSeconds) {
    if (timeDialState.transitionTarget !== timeDialState.target) {
        // Retarget from the currently visible light so rapid turns never jump in color.
        timeDialState.transitionFrom = timeDialState.scenePosition;
        timeDialState.transitionTarget = timeDialState.target;
        timeDialState.transitionElapsed = 0;
    }
    timeDialState.transitionElapsed += Math.max(0, elapsedSeconds);
    const progress = reducedMotionPreference.matches ? 1
        : Math.min(1, timeDialState.transitionElapsed / timeDialConfig.colorTransitionSeconds);
    const blend = progress * progress * (3 - 2 * progress);
    timeDialState.scenePosition = timeDialState.transitionFrom
        + (timeDialState.transitionTarget - timeDialState.transitionFrom) * blend;
}

function getNightBlend() {
    return Math.max(0, timeDialState.scenePosition - 1);
}

function unlockDialSound() {
    if (audioState.isMuted || audioState.volume === 0) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    try {
        if (!timeDialState.audioContext) {
            const context = new AudioContextClass();
            timeDialState.audioContext = context;
            const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * timeDialConfig.tickDuration), context.sampleRate);
            const samples = buffer.getChannelData(0);
            for (let index = 0; index < samples.length; index++) {
                samples[index] = (Math.random() * 2 - 1)
                    * Math.exp(-index / (samples.length * timeDialConfig.tickDecay));
            }
            timeDialState.tickBuffer = buffer;
        }
        const hasUserActivation = !navigator.userActivation || navigator.userActivation.isActive;
        if (timeDialState.audioContext.state === 'suspended' && hasUserActivation
            && !timeDialState.isResumingAudio) {
            timeDialState.isResumingAudio = true;
            timeDialState.audioContext.resume().then(() => {
                if (timeDialState.hasPendingTick) {
                    timeDialState.hasPendingTick = false;
                    playDialTick();
                }
            }).catch(() => {}).finally(() => {
                timeDialState.isResumingAudio = false;
            });
        }
    } catch {
        // The visual dial still works when browser audio is unavailable.
    }
}

function playDialTick() {
    const context = timeDialState.audioContext;
    if (!context || !timeDialState.tickBuffer
        || audioState.isMuted || audioState.volume === 0) return;
    if (context.state === 'suspended') {
        timeDialState.hasPendingTick = true;
        return;
    }
    if (context.state !== 'running') return;
    const now = context.currentTime;
    if (now - timeDialState.lastTickTime < timeDialConfig.minimumTickInterval) return;
    timeDialState.lastTickTime = now;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const highpass = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = timeDialState.tickBuffer;
    filter.type = 'lowpass';
    filter.frequency.value = timeDialConfig.tickLowpassFrequency;
    highpass.type = 'highpass';
    highpass.frequency.value = timeDialConfig.tickHighpassFrequency;
    gain.gain.value = audioState.volume * timeDialConfig.tickGain;
    // p5.sound wraps connect(), so connect nodes separately instead of chaining return values.
    source.connect(highpass);
    highpass.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.onended = () => {
        source.disconnect();
        highpass.disconnect();
        filter.disconnect();
        gain.disconnect();
    };
    source.start(now);
    source.stop(now + timeDialConfig.tickDuration);
}

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');
    
    colorMode(RGB, 255);
    initializeNightStars();
    
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

function initializeAudioPlayer() {
    audioElements = {
        currentSong: document.getElementById('current-song'),
        currentArtist: document.getElementById('current-artist'),
        previousButton: document.getElementById('previous-track'),
        playButton: document.getElementById('play-track'),
        nextButton: document.getElementById('next-track'),
        muteButton: document.getElementById('mute-track'),
        playIcon: document.getElementById('play-icon'),
        muteIcon: document.getElementById('mute-icon'),
        volumeControl: document.getElementById('volume-control')
    };

    if (!audioElements.currentSong || !audioElements.currentArtist) {
        return;
    }

    audioElements.previousButton.addEventListener('click', () => {
        stepTrack(-1);
    });

    audioElements.playButton.addEventListener('click', () => {
        togglePlayback();
    });

    audioElements.nextButton.addEventListener('click', () => {
        stepTrack(1);
    });

    audioElements.muteButton.addEventListener('click', () => {
        toggleMute();
    });

    audioElements.volumeControl.addEventListener('input', (event) => {
        setVolume(Number(event.target.value));
    });

    updateAudioInterface();
    window.addEventListener('load', attemptAutoplay, { once: true });
    window.addEventListener('pointerdown', unlockAudioOnInteraction, { once: true });
    window.addEventListener('keydown', unlockAudioOnInteraction, { once: true });
}

function buildAudioElement(trackIndex) {
    const audio = new Audio(encodeURI(audioState.activePlaylist[trackIndex].filePath));
    audio.autoplay = false;
    audio.preload = 'metadata';
    audio.muted = audioState.isMuted;
    audio.volume = audioState.volume;
    audio.addEventListener('ended', handleTrackEnded);
    return audio;
}

function attemptAutoplay() {
    setCurrentTrack(audioState.currentTrackIndex, false);
    tryAutoplayWithFallback();
}

function tryAutoplayWithFallback() {
    if (!audioState.currentAudio) {
        audioState.currentAudio = buildAudioElement(audioState.currentTrackIndex);
    }

    audioState.isMuted = false;
    audioState.currentAudio.muted = false;
    audioState.currentAudio.volume = audioState.volume;

    const playPromise = audioState.currentAudio.play();

    if (playPromise && typeof playPromise.then === 'function') {
        playPromise
            .then(() => {
                audioState.isPlaying = true;
                updateAudioInterface();
            })
            .catch(() => {
                audioState.isMuted = true;
                audioState.currentAudio.muted = true;
                playMutedFallback();
            });
        return;
    }

    audioState.isPlaying = true;
    updateAudioInterface();
}

function playMutedFallback() {
    if (!audioState.currentAudio) {
        return;
    }

    const fallbackPromise = audioState.currentAudio.play();

    if (fallbackPromise && typeof fallbackPromise.then === 'function') {
        fallbackPromise
            .then(() => {
                audioState.isPlaying = true;
                updateAudioInterface();
            })
            .catch(() => {
                audioState.isPlaying = false;
                updateAudioInterface();
            });
        return;
    }

    audioState.isPlaying = true;
    updateAudioInterface();
}

function unlockAudioOnInteraction() {
    audioState.hasUnlockedAudio = true;

    if (audioState.currentAudio) {
        audioState.isMuted = false;
        audioState.currentAudio.muted = false;
        audioState.currentAudio.volume = audioState.volume;
    } else {
        setCurrentTrack(audioState.currentTrackIndex, true);
        audioState.isMuted = false;

        if (audioState.currentAudio) {
            audioState.currentAudio.muted = false;
        }
    }

    updateAudioInterface();
}

function handleTrackEnded() {
    audioState.isPlaying = false;
    stepTrack(1, { shouldPlay: true });
}

function setCurrentTrack(trackIndex, shouldPlay) {
    if (audioState.currentAudio) {
        audioState.currentAudio.pause();
        audioState.currentAudio.removeEventListener('ended', handleTrackEnded);
    }

    audioState.currentTrackIndex = trackIndex;
    audioState.currentAudio = buildAudioElement(trackIndex);
    audioState.isPlaying = false;

    if (shouldPlay) {
        playCurrentTrack();
    } else {
        updateAudioInterface();
    }
}

function playCurrentTrack() {
    if (!audioState.currentAudio) {
        audioState.currentAudio = buildAudioElement(audioState.currentTrackIndex);
    }

    audioState.currentAudio.muted = audioState.isMuted;
    audioState.currentAudio.volume = audioState.volume;
    const playPromise = audioState.currentAudio.play();

    if (playPromise && typeof playPromise.then === 'function') {
        playPromise
            .then(() => {
                audioState.isPlaying = true;
                updateAudioInterface();
            })
            .catch(() => {
                audioState.isPlaying = false;
                updateAudioInterface();
            });
        return;
    }

    audioState.isPlaying = true;
    updateAudioInterface();
}

function togglePlayback() {
    if (!audioState.currentAudio) {
        setCurrentTrack(audioState.currentTrackIndex, true);
        return;
    }

    if (audioState.isPlaying) {
        audioState.currentAudio.pause();
        audioState.isPlaying = false;
        updateAudioInterface();
        return;
    }

    playCurrentTrack();
}

function stepTrack(direction, options = {}) {
    const shouldPlay = options.shouldPlay ?? audioState.isPlaying;
    const nextTrackIndex = (
        audioState.currentTrackIndex + direction + audioState.activePlaylist.length
    ) % audioState.activePlaylist.length;
    setCurrentTrack(nextTrackIndex, shouldPlay);
}

function toggleMute() {
    audioState.isMuted = !audioState.isMuted;

    if (audioState.currentAudio) {
        audioState.currentAudio.muted = audioState.isMuted;
    }

    updateAudioInterface();
}

function setVolume(nextVolume) {
    audioState.volume = constrain(nextVolume, 0, 1);

    if (audioState.currentAudio) {
        audioState.currentAudio.volume = audioState.volume;
    }

    if (audioState.volume > 0 && audioState.isMuted) {
        audioState.isMuted = false;

        if (audioState.currentAudio) {
            audioState.currentAudio.muted = false;
        }
    }

    updateAudioInterface();
}

function updateAudioInterface() {
    if (!audioElements) {
        return;
    }

    const activeTrack = audioState.activePlaylist[audioState.currentTrackIndex];
    audioElements.currentSong.textContent = activeTrack.title;
    audioElements.currentArtist.textContent = activeTrack.artist;
    audioElements.playButton.setAttribute(
        'aria-label',
        audioState.isPlaying ? 'Pause current song' : 'Play current song'
    );
    audioElements.playIcon.textContent = audioState.isPlaying ? '⏸' : '▶';
    audioElements.muteButton.setAttribute(
        'aria-label',
        audioState.isMuted ? 'Unmute audio' : 'Mute audio'
    );
    audioElements.muteIcon.textContent = audioState.isMuted || audioState.volume === 0 ? '🔇' : '🔊';
    audioElements.volumeControl.value = String(audioState.volume);
}

function draw() {
    updateTimeDial();
    drawBeachScene();
    drawNightStars();
    updateAndDrawShootingStars();
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

function getSceneMode() {
    return sceneModes[sceneModeIndex];
}

function isSunsetMode() {
    return getSceneMode() === 'sunset';
}

function isNightMode() {
    return getSceneMode() === 'night';
}

function cycleSceneMode() {
    const currentStop = Math.round(timeDialState.target * timeDialConfig.ticksPerMood);
    setTimeDialValue(timeDialStops[(currentStop + 1) % timeDialStops.length].value);
    commitTimeDialMood();
}

function getActivePlaylist() {
    return isNightMode() ? nightAudioPlaylist : dayAudioPlaylist;
}

function syncPlaylistToSceneMode() {
    const nextPlaylist = getActivePlaylist();

    if (audioState.activePlaylist === nextPlaylist) {
        return;
    }

    const previousTrack = audioState.activePlaylist[audioState.currentTrackIndex];
    const nextTrackIndex = nextPlaylist.findIndex((track) => (
        previousTrack && track.filePath === previousTrack.filePath
    ));

    audioState.activePlaylist = nextPlaylist;

    if (nextTrackIndex >= 0) {
        audioState.currentTrackIndex = nextTrackIndex;
        updateAudioInterface();
        return;
    }

    setCurrentTrack(0, audioState.isPlaying);
}

function getActiveSceneColors() {
    return blendedSceneColors;
}

function getSceneColors(mode) {
    if (twilightPalettes[mode]) {
        return { ...getSceneColors('sunset'), ...twilightPalettes[mode] };
    }

    if (mode === 'night') {
        return {
            skyTop: colorPalette.nightTop,
            skyMid: colorPalette.nightMid,
            horizon: colorPalette.nightHorizon,
            cloud: colorPalette.nightCloud,
            waterLight: colorPalette.nightWaterLight,
            waterMid: colorPalette.nightWaterMid,
            waterDark: colorPalette.nightWaterDark,
            sandTop: colorPalette.nightSandTop,
            sandBottom: colorPalette.nightSandBottom,
            wetSand: colorPalette.nightWetSand,
            foam: colorPalette.nightFoam,
            sunBody: colorPalette.moon,
            sunRays: colorPalette.moonGlow,
            boatHull: colorPalette.nightBoatHull,
            boatMast: colorPalette.nightBoatMast
        };
    }

    if (mode === 'sunset') {
        return {
            skyTop: colorPalette.sunsetTop,
            skyMid: colorPalette.sunsetBottom,
            horizon: colorPalette.sunsetHorizon,
            cloud: colorPalette.sunsetCloud,
            waterLight: colorPalette.sunsetWaterLight,
            waterMid: colorPalette.sunsetWaterMid,
            waterDark: colorPalette.sunsetWaterDark,
            sandTop: colorPalette.sunsetSandTop,
            sandBottom: colorPalette.sunsetSandBottom,
            wetSand: colorPalette.sunsetWetSand,
            foam: colorPalette.sunsetFoam,
            sunBody: colorPalette.sunsetSun,
            sunRays: colorPalette.sunsetSunRays,
            boatHull: colorPalette.boatHull,
            boatMast: colorPalette.boatMast
        };
    }

    return {
        skyTop: colorPalette.skyTop,
        skyMid: colorPalette.skyMid,
        horizon: colorPalette.horizon,
        cloud: colorPalette.particle,
        waterLight: colorPalette.waterLight,
        waterMid: colorPalette.waterMid,
        waterDark: colorPalette.waterDark,
        sandTop: colorPalette.sandTop,
        sandBottom: colorPalette.sandBottom,
        wetSand: colorPalette.wetSand,
        foam: colorPalette.foam,
        sunBody: colorPalette.sun,
        sunRays: colorPalette.sunRays,
        boatHull: colorPalette.boatHull,
        boatMast: colorPalette.boatMast
    };
}

function initializeNightStars() {
    nightStars = [];

    for (let i = 0; i < 55; i++) {
        nightStars.push(createNightStar());
    }
}

function createNightStar() {
    return {
        x: random(width),
        y: random(height * 0.08, height * 0.52),
        size: random(1.8, 4.6),
        twinkleOffset: random(TWO_PI),
        twinkleSpeed: random(0.01, 0.03),
        opacity: random(80, 170),
        isVisible: true,
        reappearAt: 0
    };
}

function drawBeachScene() {
    const skyHeight = height * 0.6;
    const horizonY = height * 0.65;
    const activeColors = getActiveSceneColors();
    
    noStroke();

    for (let i = 0; i < 60; i++) {
        const y1 = map(i, 0, 60, 0, skyHeight);
        const y2 = map(i + 1, 0, 60, 0, skyHeight);
        const inter = i / 60;
        const r = lerp(activeColors.skyTop[0], activeColors.skyMid[0], inter);
        const g = lerp(activeColors.skyTop[1], activeColors.skyMid[1], inter);
        const b = lerp(activeColors.skyTop[2], activeColors.skyMid[2], inter);
        fill(r, g, b);
        rect(0, y1, width, y2 - y1);
    }

    for (let i = 0; i < 15; i++) {
        const y1 = map(i, 0, 15, skyHeight, horizonY);
        const inter = i / 15;
        const r = lerp(activeColors.skyMid[0], activeColors.horizon[0], inter);
        const g = lerp(activeColors.skyMid[1], activeColors.horizon[1], inter);
        const b = lerp(activeColors.skyMid[2], activeColors.horizon[2], inter);
        fill(r, g, b);
        rect(0, y1, width, (horizonY - skyHeight) / 15);
    }

    if (getNightBlend() > 0) {
        fill(colorPalette.moonGlow[0], colorPalette.moonGlow[1], colorPalette.moonGlow[2], 35 * getNightBlend());
        ellipse(width * 0.5, horizonY + 12, width * 0.58, 54);
    }
}

function drawNightStars() {
    const nightBlend = getNightBlend();
    if (nightBlend <= 0) {
        return;
    }

    noStroke();

    for (const star of nightStars) {
        if (!star.isVisible) {
            if (millis() >= star.reappearAt) {
                Object.assign(star, createNightStar());
            } else {
                continue;
            }
        }

        const twinkle = (sin(frameCount * star.twinkleSpeed + star.twinkleOffset) + 1) * 0.5;
        const starOpacity = (star.opacity + twinkle * 70) * nightBlend;
        fill(colorPalette.star[0], colorPalette.star[1], colorPalette.star[2], starOpacity);
        circle(star.x, star.y, star.size + twinkle * 0.8);
    }
}

function updateAndDrawShootingStars() {
    if (!isNightMode()) {
        shootingStars = [];
        return;
    }

    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const shootingStar = shootingStars[i];
        shootingStar.x += shootingStar.velocityX;
        shootingStar.y += shootingStar.velocityY;
        shootingStar.opacity -= shootingStar.fadeSpeed;
        shootingStar.tailLength += 0.8;

        if (
            shootingStar.opacity <= 0 ||
            shootingStar.x > width + 120 ||
            shootingStar.y > height + 120 ||
            shootingStar.x < -120
        ) {
            shootingStars.splice(i, 1);
            continue;
        }

        drawShootingStarTail(shootingStar);

        noStroke();
        fill(colorPalette.star[0], colorPalette.star[1], colorPalette.star[2], shootingStar.opacity);
        circle(shootingStar.x, shootingStar.y, shootingStar.size);
    }
}

function drawShootingStarTail(shootingStar) {
    const tailSegments = 7;
    const tailStartX = shootingStar.x - shootingStar.velocityX * shootingStar.tailLength;
    const tailStartY = shootingStar.y - shootingStar.velocityY * shootingStar.tailLength;
    const tailMidX = lerp(tailStartX, shootingStar.x, 0.68);
    const tailMidY = lerp(tailStartY, shootingStar.y, 0.68);

    strokeCap(ROUND);

    stroke(colorPalette.star[0], colorPalette.star[1], colorPalette.star[2], shootingStar.opacity * 0.16);
    strokeWeight(shootingStar.size * 0.5);
    line(tailStartX, tailStartY, shootingStar.x, shootingStar.y);

    stroke(colorPalette.star[0], colorPalette.star[1], colorPalette.star[2], shootingStar.opacity * 0.5);
    strokeWeight(shootingStar.size * 0.34);
    line(tailMidX, tailMidY, shootingStar.x, shootingStar.y);

    noStroke();
    fill(colorPalette.star[0], colorPalette.star[1], colorPalette.star[2], shootingStar.opacity * 0.25);
    circle(shootingStar.x, shootingStar.y, shootingStar.size * 2.1);
}

function checkNightStarClick(mx, my) {
    if (!isNightMode()) {
        return null;
    }

    for (const star of nightStars) {
        if (!star.isVisible) {
            continue;
        }

        if (dist(mx, my, star.x, star.y) <= star.size + 5) {
            return star;
        }
    }

    return null;
}

function createShootingStar(star) {
    if (shootingStars.length >= MAX_SHOOTING_STARS) {
        shootingStars.shift();
    }

    star.isVisible = false;
    star.reappearAt = millis() + 60000;
    const launchAngle = random(-PI * 0.9, PI * 0.15);
    const launchSpeed = random(5.8, 8.8);
    const velocityX = cos(launchAngle) * launchSpeed;
    const velocityY = sin(launchAngle) * launchSpeed;

    shootingStars.push({
        x: star.x,
        y: star.y,
        velocityX: velocityX,
        velocityY: velocityY,
        tailLength: random(4, 7),
        fadeSpeed: random(0.8, 1.2),
        opacity: 255,
        size: max(2.2, star.size * 0.95)
    });
}

function drawClouds() {
    const time = frameCount * 0.003;
    const activeColors = getActiveSceneColors();
    
    noStroke();
    fill(activeColors.cloud[0], activeColors.cloud[1], activeColors.cloud[2], 200 - 80 * getNightBlend());
    
    for (let i = 0; i < 4; i++) {
        const cloudX = (width * 0.2) + (i * width * 0.25) + sin(time + i * 0.5) * 15;
        const cloudY = height * 0.25 + i * 50;
        const cloudSize = 80 + i * 15;
        
        push();
        translate(cloudX, cloudY);
        shadeSunsetCloud(cloudSize, activeColors.cloud);
        
        ellipse(0, 0, cloudSize, cloudSize * 0.6);
        ellipse(cloudSize * 0.4, 0, cloudSize * 0.7, cloudSize * 0.5);
        ellipse(-cloudSize * 0.3, 0, cloudSize * 0.6, cloudSize * 0.5);
        ellipse(cloudSize * 0.2, -cloudSize * 0.15, cloudSize * 0.5, cloudSize * 0.4);
        ellipse(-cloudSize * 0.2, -cloudSize * 0.1, cloudSize * 0.5, cloudSize * 0.4);
        
        pop();
    }
}

function shadeSunsetCloud(cloudSize, cloudColor) {
    const sunsetBlend = getSunsetBlend();
    if (sunsetBlend <= 0.001) return;
    const cloudOpacity = (200 - 80 * getNightBlend()) / 255;
    const gradient = drawingContext.createLinearGradient(0, -cloudSize * 0.4, 0, cloudSize * 0.25);
    const shadow = colorPalette.sunsetCloudShadow;
    const highlight = colorPalette.sunsetCloudHighlight;
    // Low sunlight warms the underside while the cloud tops stay in cool shadow.
    gradient.addColorStop(0, blendCloudLight(cloudColor, shadow, sunsetBlend, cloudOpacity));
    gradient.addColorStop(1, blendCloudLight(cloudColor, highlight, sunsetBlend, cloudOpacity));
    drawingContext.fillStyle = gradient;
}

function blendCloudLight(cloudColor, lightColor, amount, opacity) {
    const red = lerp(cloudColor[0], lightColor[0], amount);
    const green = lerp(cloudColor[1], lightColor[1], amount);
    const blue = lerp(cloudColor[2], lightColor[2], amount);
    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
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
    const activeColors = getActiveSceneColors();

    push();
    translate(sailboat.x, sailboat.y);

    noStroke();
    fill(84, 120, 140, 40);
    ellipse(0, 8, sailboat.width * 1.05, 10);

    fill(activeColors.boatHull[0], activeColors.boatHull[1], activeColors.boatHull[2]);
    beginShape();
    vertex(-sailboat.width * 0.38, 0);
    vertex(sailboat.width * 0.32, 0);
    vertex(sailboat.width * 0.2, sailboat.height * 0.18);
    vertex(-sailboat.width * 0.3, sailboat.height * 0.18);
    endShape(CLOSE);

    stroke(activeColors.boatMast[0], activeColors.boatMast[1], activeColors.boatMast[2]);
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

function getSunsetBlend() {
    return Math.max(0, 1 - Math.abs(timeDialState.scenePosition - 1));
}

function drawSun() {
    const sunX = 120;
    const sunY = 120;
    const sunSize = 80;
    const rayLength = 40;
    const numRays = 16;
    const activeColors = getActiveSceneColors();
    const rayRotationSpeed = isSunsetMode() ? 0.004 : 0.01;
    
    push();
    translate(sunX, sunY);

    if (isNightMode()) {
        noStroke();
        fill(colorPalette.moonGlow[0], colorPalette.moonGlow[1], colorPalette.moonGlow[2], 55);
        ellipse(-4, 2, sunSize * 0.68, sunSize * 0.68);

        fill(activeColors.sunBody[0], activeColors.sunBody[1], activeColors.sunBody[2]);
        ellipse(0, 0, sunSize * 0.66, sunSize * 0.66);

        fill(colorPalette.nightTop[0], colorPalette.nightTop[1], colorPalette.nightTop[2], 255);
        ellipse(sunSize * 0.17, 0, sunSize * 0.62, sunSize * 0.62);
    } else {
        rotate(frameCount * rayRotationSpeed);
        noStroke();

        for (let i = 0; i < numRays; i++) {
            const angle = (TWO_PI / numRays) * i;
            const x1 = cos(angle) * (sunSize / 2 + 10);
            const y1 = sin(angle) * (sunSize / 2 + 10);
            const x2 = cos(angle) * (sunSize / 2 + rayLength);
            const y2 = sin(angle) * (sunSize / 2 + rayLength);
            
            stroke(activeColors.sunRays[0], activeColors.sunRays[1], activeColors.sunRays[2], 200);
            strokeWeight(4);
            line(x1, y1, x2, y2);
        }

        fill(activeColors.sunBody[0], activeColors.sunBody[1], activeColors.sunBody[2]);
        noStroke();
        ellipse(0, 0, sunSize, sunSize);
    }

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
    const waveTimeScale = 0.02 - 0.008 * getNightBlend();
    const time = frameCount * waveTimeScale;
    const activeColors = getActiveSceneColors();
    const waterLight = activeColors.waterLight;
    const waterMid = activeColors.waterMid;
    const waterDark = activeColors.waterDark;
    
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
    const activeColors = getActiveSceneColors();
    
    noStroke();
    
    fill(activeColors.sandTop[0], activeColors.sandTop[1], activeColors.sandTop[2]);
    ellipse(width * 0.5, height - 50, width * 2, height - horizonY + 100);
    
    fill(activeColors.sandBottom[0], activeColors.sandBottom[1], activeColors.sandBottom[2]);
    ellipse(width * 0.5, height - 30, width * 1.8, height - horizonY + 80);
}

function updateAndDrawTideWash() {
    const horizonY = height * 0.65;
    const shorelineY = horizonY + 34;
    const activeTideCycleDuration = isNightMode() ? TIDE_CYCLE_DURATION * 1.4 : TIDE_CYCLE_DURATION;
    const tideProgress = (millis() % activeTideCycleDuration) / activeTideCycleDuration;
    const tideReach = getTideReach(tideProgress);
    const washFrontY = shorelineY + tideReach;
    const activeColors = getActiveSceneColors();
    const waterLight = activeColors.waterLight;
    const waterMid = activeColors.waterMid;

    softenSandMarksForTideWash(washFrontY);

    noStroke();
    fill(activeColors.wetSand[0], activeColors.wetSand[1], activeColors.wetSand[2], 110);
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
    fill(activeColors.foam[0], activeColors.foam[1], activeColors.foam[2], 120);
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

    fill(activeColors.foam[0], activeColors.foam[1], activeColors.foam[2], 150);
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

    fill(activeColors.foam[0], activeColors.foam[1], activeColors.foam[2], 80);
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
    const activeColors = getActiveSceneColors();
    
    noStroke();
    
    for (let grain of sandGrains) {
        if (grain.y >= sandStartY && grain.y <= height) {
            const r = constrain(activeColors.sandTop[0] + grain.brightness, activeColors.sandTop[0] - 20, activeColors.sandTop[0] + 20);
            const g = constrain(activeColors.sandTop[1] + grain.brightness, activeColors.sandTop[1] - 20, activeColors.sandTop[1] + 20);
            const b = constrain(activeColors.sandTop[2] + grain.brightness, activeColors.sandTop[2] - 20, activeColors.sandTop[2] + 20);
            
            fill(r, g, b, grain.opacity);
            circle(grain.x, grain.y, grain.size);
        }
    }
    
    for (let i = 0; i < 50; i++) {
        const x = random(width);
        const y = random(sandStartY, height - 10);
        const size = random(0.5, 2);
        const brightness = random(-10, 10);
        
        const r = constrain(activeColors.sandTop[0] + brightness, activeColors.sandTop[0] - 14, activeColors.sandTop[0] + 14);
        const g = constrain(activeColors.sandTop[1] + brightness, activeColors.sandTop[1] - 14, activeColors.sandTop[1] + 14);
        const b = constrain(activeColors.sandTop[2] + brightness, activeColors.sandTop[2] - 14, activeColors.sandTop[2] + 14);
        
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
    const particleOpacityScale = isNightMode() ? 1.75 : 1;

    for (let particle of particles) {
        particle.y += particle.speed;
        
        if (particle.y > height * 0.6) {
            particle.y = -10;
            particle.x = random(width);
        }
        
        fill(colorPalette.particle[0], colorPalette.particle[1], colorPalette.particle[2], particle.opacity * particleOpacityScale);
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

function mousePressed(event) {
    if (event?.target?.closest('.time-dial')) return;
    const clickedSailboat = checkSailboatClick(mouseX, mouseY);
    const clickedSun = checkSunClick(mouseX, mouseY);
    const clickedNightStar = checkNightStarClick(mouseX, mouseY);
    const clickedCloud = checkCloudClick(mouseX, mouseY);
    const clickedWater = checkWaterClick(mouseX, mouseY);
    const clickedSand = checkSandClick(mouseX, mouseY);
    
    if (clickedSailboat) {
        sailColorIndex = (sailColorIndex + 1) % sailColors.length;
    } else if (clickedSun) {
        cycleSceneMode();
    } else if (clickedNightStar) {
        createShootingStar(clickedNightStar);
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

function touchStarted(event) {
    if (event?.target?.closest('.time-dial')) return true;
    const clickedSailboat = checkSailboatClick(mouseX, mouseY);
    const clickedSun = checkSunClick(mouseX, mouseY);
    const clickedNightStar = checkNightStarClick(mouseX, mouseY);
    const clickedCloud = checkCloudClick(mouseX, mouseY);
    const clickedWater = checkWaterClick(mouseX, mouseY);
    const clickedSand = checkSandClick(mouseX, mouseY);
    
    if (clickedSailboat) {
        sailColorIndex = (sailColorIndex + 1) % sailColors.length;
    } else if (clickedSun) {
        cycleSceneMode();
    } else if (clickedNightStar) {
        createShootingStar(clickedNightStar);
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

function touchMoved(event) {
    if (event?.target?.closest('.time-dial')) return true;
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

function touchEnded(event) {
    if (event?.target?.closest('.time-dial')) return true;
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
    initializeNightStars();
    
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
