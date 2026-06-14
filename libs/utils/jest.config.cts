module.exports = {
  coverageDirectory: "../../coverage/libs/utils",
  displayName: "utils",
  moduleFileExtensions: ["ts", "js", "html"],
  preset: "../../jest.preset.js",
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
};
