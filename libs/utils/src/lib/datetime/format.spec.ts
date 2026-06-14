import { formatShortDate } from "./format";

describe("formatShortDate", () => {
  it("formats en-IN short dates", () => {
    expect(formatShortDate(new Date("2026-06-05T12:00:00"))).toBe("5 Jun 2026");
  });
});
