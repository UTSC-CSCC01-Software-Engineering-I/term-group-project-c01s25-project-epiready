export default {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.js",
    "@testing-library/jest-dom"
  ],
  moduleFileExtensions: ["js", "jsx"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
};