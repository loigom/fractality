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

function burningShip(real_constant, imag_constant) {
    let iters = real = imag = 0;
    let realSq, imagSq, newReal, newImag;
    while ((realSq = real*real) + (imagSq = imag*imag) <= MOD_CONST && iters < MAX_ITER) {
        newReal = realSq - imagSq + real_constant;
        newImag = Math.abs(2 * real * imag) + imag_constant;
        real = newReal;
        imag = newImag;
        iters++;
    }
    return iters;
}
