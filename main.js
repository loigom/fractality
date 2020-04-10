/* Things related to rendering */
const MAX_ITER_DEFAULT = 50;
let MAX_ITER = MAX_ITER_DEFAULT; // Amount of "passes" to do during rendering. Higher -> better fractal detail.
const MOD_CONST = 4; // Variable to determine if a pixel/complex number has escaped.

const RE_START_DEFAULT = -2;
const RE_END_DEFAULT = 1;
const IM_START_DEFAULT = -1;
const IM_END_DEFAULT = 1;

let RE_START = RE_START_DEFAULT; // These 4 are for determining the boundaries.
let RE_END = RE_END_DEFAULT;
let IM_START = IM_START_DEFAULT;
let IM_END = IM_END_DEFAULT;

let RE_START_NEW;
let IM_START_NEW;
/* ------------------- */

/* These variables are for thread control so the entire window isn't blocked until the entire fractal is finished rendering. */
let RENDERING = true;
const DRAW_TICKRATE = 1;
const ROWS_PER_TICK = 8; /* This determines how many rows get rendered before the thread control is released back to the browser for drawing on screen.
                            A higher amount generally means faster rendering, but the process looks more choppy. */
let y = 0; // The y-coordinate used in draw()
/* ------------------- */

/* Some colors. */
const BLACK = [0, 0, 0];
/* ------------------- */

/* Canvas related things */
const canvas = document.getElementById("canv");
const ctx = canvas.getContext("2d");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const regionBox = document.getElementById("region"); /* Visual representation of the region that the user wants to zoom into */
regionBoxXStart = 0;
regionBoxYStart = 0;
regionBoxXEnd = 0;
regionBoxYEnd = 0;

canvas.onmousedown = function(e) {
    regionBox.hidden = 0;
    regionBoxXStart = e.clientX;
    regionBoxYStart = e.clientY;
    calculateRegionBox();
    [RE_START_NEW, IM_START_NEW] = screenToComplexCoords(e.clientX, e.clientY);
}

canvas.onmousemove = function (e) {
    regionBoxXEnd = e.clientX;
    regionBoxYEnd = e.clientY;
    calculateRegionBox();
}

canvas.onmouseup = function(e) {
    regionBox.hidden = 1;
    [RE_END, IM_END] = screenToComplexCoords(e.clientX, e.clientY);
    RE_START = RE_START_NEW;
    IM_START = IM_START_NEW;
    startRender();
}

regionBox.onmousemove = canvas.onmousemove;
regionBox.onmouseup = canvas.onmouseup;

function calculateRegionBox() {
    x1 = Math.min(regionBoxXStart, regionBoxXEnd);
    x2 = Math.max(regionBoxXStart, regionBoxXEnd); 

    y1 = Math.min(regionBoxYStart, regionBoxYEnd);
    y2 = Math.max(regionBoxYStart, regionBoxYEnd); 

    regionBox.style.left = x1 + "px";
    regionBox.style.width = (x2 - x1) + "px";
    regionBox.style.top = y1 + "px";
    regionBox.style.height = (y2 - y1) + "px";
}
/* ------------------- */

/* Color palette checkboxes */
let greyscale = document.getElementById("greyscaleCheckbox");
let greenscale = document.getElementById("greenscaleCheckbox");
let bluescale = document.getElementById("bluescaleCheckbox");
let redscale = document.getElementById("redscaleCheckbox");
let palettes = [greyscale, greenscale, bluescale, redscale];

let CURRENT_COLOR = greenscale;
CURRENT_COLOR.checked = 1;

for (let i = 0; i < palettes.length; i++) {
    palettes[i].onclick = function() {
        CURRENT_COLOR.checked = 0;
        palettes[i].checked = 1;
        CURRENT_COLOR = palettes[i];
    }
}
/* ------------------- */

/* Other */
let iterationsInput = document.getElementById("iterationsInput");
iterationsInput.value = `${MAX_ITER_DEFAULT}`;
iterationsInput.innerHTML = MAX_ITER_DEFAULT;
document.getElementById("resetButton").onclick = function() {
    RE_START = RE_START_DEFAULT;
    RE_END = RE_END_DEFAULT;
    IM_START = IM_START_DEFAULT;
    IM_END = IM_END_DEFAULT;
    startRender();
}
document.getElementById("iterationsInputApply").onclick = function() {
    let inp = parseInt(iterationsInput.value);
    if (inp != NaN && inp > 0) {
        MAX_ITER = inp;
        startRender();
    }
    else {
        iterationsInput.value = `${MAX_ITER_DEFAULT}`;
    }
}
/* ------------------- */

function startRender() {
    y = 0;
    RENDERING = true;
}

function screenToComplexCoords(x, y) {
    let realPerPixel = Math.abs(RE_START - RE_END) / window.innerWidth;
    let imagPerPixel = Math.abs(IM_START - IM_END) / window.innerHeight;
    return [realPerPixel * x + RE_START, imagPerPixel * y + IM_START];
}

function setPixel(x, y, r, g, b) {
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(x, y, 1, 1);
}

// This is just some greyscale color pallette I made up. Looks okay-ish.
function setRBG(iters) {
    let quotinent = iters / MAX_ITER;
    if (quotinent > 0.9) { return BLACK; }
    let rgb = Math.floor((255 / MAX_ITER) * iters);
    if (greyscale.checked) {
        return [rgb, rgb, rgb];
    }
    else if (redscale.checked) {
        return [rgb, 0, 0];
    }
    else if (greenscale.checked) {
        return [0, rgb, 0];
    }
    else {
        return [0, 0, rgb];
    }
}

function draw() {
    if (RENDERING) {
        if (y == canvas.height) {
            RENDERING = false;
            y = 0;
        }
        else {
            let x, real, imag, iters, r, g, b;
            let i = ROWS_PER_TICK;
            let realDistance = RE_END - RE_START;
            let imagDistance = IM_END - IM_START;
            while (y < canvas.height && i--) {
                for (x = 0; x < canvas.width; x++) {
                    real = RE_START + (x / canvas.width) * realDistance;
                    imag = IM_START + (y / canvas.height) * imagDistance;
                    iters = mandelbrot(real, imag);
                    [r, g, b] = setRBG(iters);
                    setPixel(x, y, r, g, b);
                }
                y++;
            }
        }
    }
}

function mandelbrot(real_constant, imag_constant) {
    let iters = real = imag = 0;
    let realSq, imagSq, newReal, newImag;
    while ((realSq = real*real) + (imagSq = imag*imag) <= MOD_CONST && iters < MAX_ITER) {
        newReal = realSq - imagSq + real_constant;
        newImag = 2 * real * imag + imag_constant;
        real = newReal;
        imag = newImag;
        iters++;
    }
    return iters;
}

setInterval(draw, DRAW_TICKRATE);
