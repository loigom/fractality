let canvas = document.getElementById("canv");
let ctx = canvas.getContext("2d");

MAX_ITER = 80
MOD_CONST = 2

RE_START = -2
RE_END = 1
IM_START = -1
IM_END = 1

function setPixel(x, y, r, g, b) {
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(x, y, 1, 1);
}

function setRBG(iters) {
    let quotinent = iters / MAX_ITER;
    if (quotinent > 0.9) { return [0, 0, 0]; }
    let rgb = Math.floor((255 / MAX_ITER) * iters);
    return [rgb, rgb, rgb];
}

function draw() {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    let x, y, real, imag, iters, r, g, b;
    for (x = 0; x < canvas.width; x++) {
        for (y = 0; y < canvas.height; y++) {
            real = RE_START + (x / canvas.width) * (RE_END - RE_START);
            imag = IM_START + (y / canvas.height) * (IM_END - IM_START);
            iters = mandelbrot(real, imag);
            [r, g, b] = setRBG(iters);
            setPixel(x, y, r, g, b);
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

draw();
