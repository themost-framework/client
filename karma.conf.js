// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html
// tslint:disable trailing-comma
// tslint:disable object-literal-sort-keys
require('dotenv').config({ path: '.env' })

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
      require('karma-mocha-reporter')
    ],
    preprocessors: {
      "**/*.ts": "karma-typescript" // *.tsx for React Jsx
    },
    karmaTypescriptConfig: {
      tsconfig: "./tsconfig.spec.json",
      sourceMap: true
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
    reporters: [ 'kjhtml' ],
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: [ "ChromeHeadlessNoSandbox" ],
    singleRun: false
  });
};
// tslint:enable trailing-comma
// tslint:enable object-literal-sort-keys
