module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['__fixtures__'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!**/node_modules/**'
  ]
};