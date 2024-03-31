const typescript = require("@rollup/plugin-typescript");
const pkg = require("./package.json");
const path = require("path");

module.exports = [
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'cjs',
      sourcemap: true
    },
    external: Object.keys(pkg.dependencies),
    plugins: [typescript({
      tsconfig: path.resolve(process.cwd(), 'tsconfig.lib.json')
    })]
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    },
    external: Object.keys(pkg.dependencies),
    plugins: [typescript({
      tsconfig: path.resolve(process.cwd(), 'tsconfig.lib.json')
    })]
  },
  {
    input: 'src/index.ts',
    output: {
      name: '@themost/client',
      file: 'dist/index.umd.js',
      format: 'umd',
      sourcemap: true
    },
    external: Object.keys(pkg.dependencies),
    plugins: [typescript({
      tsconfig: path.resolve(process.cwd(), 'tsconfig.lib.json')
    })]
  },
  {
    input: path.resolve(process.cwd(), 'common/src/index.ts'),
    output: {
      dir: 'common/dist',
      format: 'cjs',
      sourcemap: true
    },
    external: Object.keys(pkg.dependencies).concat(['@themost/client']),
    plugins: [
      typescript({
        tsconfig: path.resolve(process.cwd(), 'common/tsconfig.lib.json'),
        declaration: true,
        declarationDir: 'common/dist/'
      })]
  },
  {
    input: 'common/src/index.ts',
    output: {
      name: '@themost/client/common',
      file: 'common/dist/index.umd.js',
      format: 'umd',
      sourcemap: true
    },
    external: Object.keys(pkg.dependencies).concat(['@themost/client']),
    plugins: [typescript({
      tsconfig: path.resolve(process.cwd(), 'common/tsconfig.lib.json')
    })]
  },
  {
    input: 'common/src/index.ts',
    output: {
      file: 'common/dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    },
    external: Object.keys(pkg.dependencies).concat(['@themost/client']),
    plugins: [typescript({
      tsconfig: path.resolve(process.cwd(), 'common/tsconfig.lib.json')
    })]
  },
  {
    input: path.resolve(process.cwd(), 'util/src/index.ts'),
    output: {
      dir: 'util/dist',
      format: 'cjs',
      sourcemap: true
    },
    external: Object.keys(pkg.dependencies).concat(['@themost/client', '@themost/client/common']),
    plugins: [
      typescript({
        tsconfig: path.resolve(process.cwd(), 'util/tsconfig.lib.json'),
        declaration: true,
        declarationDir: 'util/dist/'
      })]
  },
  {
    input: 'util/src/index.ts',
    output: {
      file: 'util/dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    },
    external: Object.keys(pkg.dependencies).concat(['@themost/client', '@themost/client/common']),
    plugins: [typescript({
      tsconfig: path.resolve(process.cwd(), 'util/tsconfig.lib.json')
    })]
  }
];
