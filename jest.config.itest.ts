import type { Config } from "@jest/types";

const configure: Config.InitialOptions = {
  roots: ["<rootDir>/src/itest"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  verbose: true,
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!axios)/"],
  moduleNameMapper: {
    "^axios$": require.resolve("axios"),
  },
  testEnvironment: "node", // To be able to make HTTP requests
};

export default configure;
