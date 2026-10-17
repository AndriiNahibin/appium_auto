module.exports = {
  "node-option": ["import=tsx"],
  require: ["test/hooks.ts"],
  // no "spec" here: Mocha adds files from the command line to it instead of replacing,
  // so "npx mocha test/x.ts" would run everything. The full set is in the "test" npm script
  ignore: ["test/hooks.ts"],
  timeout: 120000,
  reporter: "allure-mocha",
  "reporter-option": ["resultsDir=allure-results", "extraReporters=spec"],
};
