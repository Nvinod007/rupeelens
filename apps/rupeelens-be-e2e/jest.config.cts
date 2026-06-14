export default {
  coverageDirectory: "../../coverage/rupeelens-be-e2e",
  displayName: "rupeelens-be-e2e",
  globalSetup: "<rootDir>/src/support/global-setup.ts",
  globalTeardown: "<rootDir>/src/support/global-teardown.ts",
  moduleFileExtensions: ["ts", "js", "html"],
  preset: "../../jest.preset.js",
  setupFiles: ["<rootDir>/src/support/test-setup.ts"],
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.spec.json",
      },
    ],
  },
};
