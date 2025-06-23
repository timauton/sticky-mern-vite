import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import { HomePage } from "../../src/pages/Home/HomePage";

// Mock getMeme to prevent 401s
vi.mock("../../src/services/memeSelector", () => ({
  default: vi.fn().mockResolvedValue({ meme: { _id: "123", url: "/fake.jpg" } })
}));


describe("Home Page", () => {
  beforeEach(() => {
    localStorage.clear(); //simulates a logged out state
  });

  test("Signup form shows when clicking sign up button", () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>)
    ;

   fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    // Check for a field unique to Signup form, e.g. email input:
    expect(screen.getByLabelText(/email/i)).to.exist;
  });

  test("Login form shows when clicking log in button", () => {
    render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );

    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    // Check for a field unique to Login form, e.g. username input:
    expect(screen.getByLabelText(/username/i)).to.exist;
  });
});
