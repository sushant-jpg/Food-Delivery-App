const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['.expo/*'],
    // Metro and Expo Doctor perform module resolution checks. The ESLint import
    // resolver walks above this npm workspace on Windows, which is unnecessary.
    rules: { 'import/no-unresolved': 'off' },
  },
]);
