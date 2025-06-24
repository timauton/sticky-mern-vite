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



// !!! Homepage tests:
// describe("Home Page", () => {
//   test("welcomes you to the site", () => {
//     // We need the Browser Router so that the Link elements load correctly
//     render(
//       <BrowserRouter>
//         <HomePage />
//       </BrowserRouter>
//     );

//     const heading = screen.getByRole("heading");
//     expect(heading.textContent).toEqual("Welcome to Acebook!");
//   });

//   test("Displays a signup link", async () => {
//     render(
//       <BrowserRouter>
//         <HomePage />
//       </BrowserRouter>
//     );

//     const signupLink = screen.getByText("Sign Up");
//     expect(signupLink.getAttribute("href")).toEqual("/signup");
//   });

//   test("Displays a login link", async () => {
//     render(
//       <BrowserRouter>
//         <HomePage />
//       </BrowserRouter>
//     );

//     const loginLink = screen.getByText("Log In");
//     expect(loginLink.getAttribute("href")).toEqual("/login");
//   });
// });
