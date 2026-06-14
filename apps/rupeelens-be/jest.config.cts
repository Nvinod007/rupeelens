module.exports = {
  coverageDirectory: "../../coverage/apps/rupeelens-be",
  displayName: "rupeelens-be",
  moduleFileExtensions: ["ts", "js", "html"],
  preset: "../../jest.preset.js",
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
};
