/* eslint-disable no-undef */
module.exports = {
  preset: 'ts-jest',
  modulePathIgnorePatterns: ['__fixtures__'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!**/node_modules/**'
  ]
};