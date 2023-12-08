// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html
// tslint:disable trailing-comma
// tslint:disable object-literal-sort-keys
require('dotenv').config({ path: '.env' })
const path = require('path');

module.exports = function(config) {
  config.set({
    basePath: ".",
    frameworks: ["jasmine", "karma-typescript", "api"],
    files: [
      { pattern: "src/**/*.ts" },
      { pattern: "common/src/**/*.ts" }
    ],
    port: 8080,
    plugins: [
      require('./karma-test-api-server'),
      require("karma-jasmine"),
      require("karma-typescript"),
      require("karma-chrome-launcher"),
      require("karma-jasmine-html-reporter"),
      require('karma-mocha-reporter'),
      require("karma-coverage-istanbul-reporter")
    ],
    preprocessors: {
      "**/*.ts": "karma-typescript" // *.tsx for React Jsx
    },
    coverageIstanbulReporter: {
      // reports can be any that are listed here: https://github.com/istanbuljs/istanbuljs/tree/73c25ce79f91010d1ff073aa6ff3fd01114f90db/packages/istanbul-reports/lib
      reports: ['text'],
    },
    karmaTypescriptConfig: {
      tsconfig: "./tsconfig.spec.json",
      bundlerOptions: {
        transforms: [
          require('karma-typescript-es6-transform')()
        ],
        resolve: {
          alias: {
            '@themost/client/common': path.resolve(__dirname, 'common/src/index.ts'),
            '@themost/client': path.resolve(__dirname, 'src/index.ts')
          }
        }
      }
    },
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--remote-debugging-port=9222'
        ]
      }
    },
    reporters: [ 'kjhtml', 'mocha', 'coverage-istanbul' ],
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: [ "ChromeHeadlessNoSandbox" ],
    singleRun: false
  });
};
// tslint:enable trailing-comma
// tslint:enable object-literal-sort-keys
