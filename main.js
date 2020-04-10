/* Canvas related things */
const canvas = document.getElementById("canv");
const ctx = canvas.getContext("2d");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
/* ------------------- */

/* Things related to rendering */
const MAX_ITER = 80 // Amount of "passes" to do during rendering. Higher -> better fractal precision.
const MOD_CONST = 2 // Variable to determine if a pixel/complex number has escaped.

const RE_START = -2 // These 4 are for determining which "place" in the fractal should get drawn on a x-y axis.
const RE_END = 1
const IM_START = -1
const IM_END = 1
/* ------------------- */

/* These variables are for thread control so the entire window isn't blocked until the entire fractal is finished rendering. */
let RENDERING = false;
const ROWS_PER_TICK = 8; /* This determines how many rows get rendered before the thread control is released back to the browser for drawing on screen.
                            A higher amount generally means faster rendering, but the process looks more choppy. */
let y = 0; // The y-coordinate used in draw()
/* ------------------- */


function setPixel(x, y, r, g, b) {
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(x, y, 1, 1);
}

// This is just some greyscale color pallette I made up. Looks okay-ish.
function setRBG(iters) {
    let quotinent = iters / MAX_ITER;
    if (quotinent > 0.9) { return [0, 0, 0]; }
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
            let i = 0;
            while (y < canvas.height && i < ROWS_PER_TICK) {
                for (x = 0; x < canvas.width; x++) {
                    real = RE_START + (x / canvas.width) * (RE_END - RE_START);
                    imag = IM_START + (y / canvas.height) * (IM_END - IM_START);
                    iters = mandelbrot(real, imag);
                    [r, g, b] = setRBG(iters);
                    setPixel(x, y, r, g, b);
                }
                y++;
                i++;
            }
        }
    }
}

function complex_abs(real, imag) {
    return Math.sqrt(real*real + imag*imag);
}

function complex_squared(real, imag) {
    let newReal = real * real - imag * imag;
    let newImag = 2 * real * imag;
    return [newReal, newImag];
}

function mandelbrot(real_constant, imag_constant) {
    let iters = real = imag = 0;
    while (complex_abs(real, imag) <= MOD_CONST && iters < MAX_ITER) {
        [real, imag] = complex_squared(real, imag);
        real += real_constant;
        imag += imag_constant;
        iters++;
    }
    return iters;
}

document.getElementById("drawBtn").onclick = function() { RENDERING = true; }
setInterval(draw, 15); // Tick draw() every 15ms.
