import { render } from "@testing-library/react";

import DashboardPage from "../src/app/(app)/page";

jest.mock("@auth", () => ({
  getBrowserSessionUser: jest.fn().mockResolvedValue(null),
}));

describe("DashboardPage", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<DashboardPage />);
    expect(baseElement).toBeTruthy();
  });
});
