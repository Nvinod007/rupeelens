import { formatInr, formatSignedInrAmount } from "./inr";

describe("formatInr", () => {
  it("formats INR with two decimal places", () => {
    expect(formatInr(1234.5)).toMatch(/1,234\.50/);
  });
});

describe("formatSignedInrAmount", () => {
  it("prefixes credit amounts with +", () => {
    expect(formatSignedInrAmount("100", "CREDIT")).toMatch(/^\+/);
  });

  it("prefixes debit amounts with -", () => {
    expect(formatSignedInrAmount("100", "DEBIT")).toMatch(/^-/);
  });
});
