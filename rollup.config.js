const typescript = require('@rollup/plugin-typescript');
const dist = './dist/';
const name = 'index';
const pkg = require('./package.json');

module.exports = [{
    input: 'src/index.ts',
    output: [
        {
            file: `${dist}${name}.cjs.js`,
            format: 'cjs'
        },
        {
            file: `${dist}${name}.esm.js`,
            format: 'esm'
        },
        {
            name: '@themost/client',
            file: `${dist}${name}.js`,
            format: 'umd'
        },
    ],
    external: Object.keys(pkg.dependencies),
    plugins: [
        typescript({ tsconfig: './tsconfig.json' })
    ]
}];
