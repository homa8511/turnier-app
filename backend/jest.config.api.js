module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/api.spec.ts'],
  setupFiles: ['dotenv/config'],
};