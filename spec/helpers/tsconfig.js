const tsConfig = require("../../tsconfig.spec.json");
const tsConfigPaths = require("tsconfig-paths");

const baseUrl = "./";
tsConfigPaths.register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths,
});