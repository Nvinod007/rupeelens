import { displayNameFromEmail } from "./display-name";

describe("displayNameFromEmail", () => {
  it("joins dot-separated email local parts with spaces", () => {
    expect(displayNameFromEmail("vinod.kumar@example.com")).toBe("vinod kumar");
  });

  it("returns a single local part unchanged", () => {
    expect(displayNameFromEmail("vinod@example.com")).toBe("vinod");
  });

  it("formats dot-separated names without @", () => {
    expect(displayNameFromEmail("vinod.kumar")).toBe("vinod kumar");
  });

  it("preserves names that already contain spaces", () => {
    expect(displayNameFromEmail("John Doe")).toBe("John Doe");
  });
});
