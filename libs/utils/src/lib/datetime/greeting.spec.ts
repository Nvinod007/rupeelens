import { getTimeOfDayGreeting } from "./greeting";

describe("getTimeOfDayGreeting", () => {
  it("returns morning before noon", () => {
    expect(getTimeOfDayGreeting(new Date("2026-06-05T08:00:00"))).toBe(
      "Good morning"
    );
  });

  it("returns afternoon before 5pm", () => {
    expect(getTimeOfDayGreeting(new Date("2026-06-05T14:00:00"))).toBe(
      "Good afternoon"
    );
  });

  it("returns evening after 5pm", () => {
    expect(getTimeOfDayGreeting(new Date("2026-06-05T19:00:00"))).toBe(
      "Good evening"
    );
  });
});
