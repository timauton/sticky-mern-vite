import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { StatsPage } from "../../src/pages/Stats/StatsPage";
import { expect } from "vitest";

describe("Stats Page", () => {
  test("Displays headings on Stats page", () => {
    // We need the Browser Router so that the Link elements load correctly
    render(
      <BrowserRouter>
        <StatsPage />
      </BrowserRouter>
    );

    const pageHeading = screen.getByTestId("title-text");
    expect(pageHeading.textContent).toEqual("Stats page");
  });
});
