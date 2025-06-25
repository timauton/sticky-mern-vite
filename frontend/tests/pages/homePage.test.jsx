import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import { HomePage } from "../../src/pages/Home/HomePage";

// Mock getMeme to prevent 401s
vi.mock("../../src/services/memeSelector", () => ({
  default: vi.fn().mockResolvedValue({ meme: { _id: "123", url: "/fake.jpg", tags: ["games", "cats"] }
    token: "new-token" 
  })
}));

vi.mock("../../src/components/Login", () => ({
  Login: ({ onLoginSuccess }) => (
    <div data-testid="login-form">
      <label htmlFor="username">Username</label>
      <input id="username" />
      <button onClick={onLoginSuccess}>Login Submit</button>
    </div>
  )
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
    expect(screen.getByLabelText(/email/i)).toBeDefined();
  });

  test("Login form shows when clicking log in button", () => {
    render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );

    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    // Check for a field unique to Login form, e.g. username input:
    expect(screen.getByLabelText(/username/i)).toBeDefined();
  });
});
