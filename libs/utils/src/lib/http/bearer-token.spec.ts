import { parseBearerToken } from "./bearer-token";

describe("parseBearerToken", () => {
  it("returns null when header is missing", () => {
    expect(parseBearerToken(undefined)).toBeNull();
  });

  it("returns null when prefix is wrong", () => {
    expect(parseBearerToken("Basic abc")).toBeNull();
  });

  it("returns token after Bearer prefix", () => {
    expect(parseBearerToken("Bearer eyJ.test.token")).toBe("eyJ.test.token");
  });

  it("returns null for empty bearer value", () => {
    expect(parseBearerToken("Bearer ")).toBeNull();
  });
});
