/* Things related to rendering */
let MAX_ITER = 35 // Amount of "passes" to do during rendering. Higher -> better fractal detail.
const MOD_CONST = 4 // Variable to determine if a pixel/complex number has escaped.


let RE_START = -2 // These 4 are for determining the boundaries.
let RE_END = 1
let IM_START = -1
let IM_END = 1

let RE_START_NEW;
let RE_END_NEW;
let IM_START_NEW;
let IM_END_NEW;

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
canvas.onmousedown = function(e) {
    [RE_START_NEW, IM_START_NEW] = screenToComplexCoords(e.clientX, e.clientY);
}
canvas.onmouseup = function(e) {
    [RE_END, IM_END] = screenToComplexCoords(e.clientX, e.clientY);
    RE_START = RE_START_NEW;
    IM_START = IM_START_NEW;
    MAX_ITER *= 10;
    if (MAX_ITER > 7000) {
        MAX_ITER = 7000;
    }
    y = 0;
    RENDERING = true;
}
/* ------------------- */

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
    return [rgb, rgb, rgb];
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

function complex_squared(real, imag) {
    let newReal = real * real - imag * imag;
    let newImag = 2 * real * imag;
    return [newReal, newImag];
}

function mandelbrot(real_constant, imag_constant) {
    let iters = real = imag = 0;
    while ((real*real + imag*imag) <= MOD_CONST && iters < MAX_ITER) {
        [real, imag] = complex_squared(real, imag);
        real += real_constant;
        imag += imag_constant;
        iters++;
    }
    return iters;
}

setInterval(draw, DRAW_TICKRATE);
