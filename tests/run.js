// מריץ את כל קבצי *.test.js שבתיקייה הזו.   שימוש:  node tests/run.js
const fs = require('fs');
const path = require('path');
let passed = 0, failed = 0;

global.test = function (name, fn) {
  try { fn(); passed++; console.log("  ✓ " + name); }
  catch (e) { failed++; console.log("  ✗ " + name + "\n      " + e.message); }
};
global.assertEq = function (actual, expected) {
  if (actual !== expected) {
    throw new Error("expected " + JSON.stringify(expected) + " but got " + JSON.stringify(actual));
  }
};

fs.readdirSync(__dirname)
  .filter(function (f) { return f.endsWith('.test.js'); })
  .sort()
  .forEach(function (f) {
    console.log(f);
    require(path.join(__dirname, f));
  });

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
