module.exports = {
    input: 'src/plotter.js',
    output: {
        file: 'dist/bundle.js',
        format: 'umd',
        name: 'Plotter',
        globals: {
            'expr-eval': 'exprEval',
            'Konva': 'Konva'
        }
    }
};