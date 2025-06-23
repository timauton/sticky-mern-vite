import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";

import { login } from "../../src/services/authentication";
import { Login } from "../../src/components/Login"; // Adjust path as needed

// Mocking the login service
vi.mock("../../src/services/authentication", () => {
  const loginMock = vi.fn();
  return { login: loginMock };
});

// Reusable function for filling out login form
async function completeLoginForm() {
  const user = userEvent.setup();

  const usernameInputEl = screen.getByLabelText("Username:");
  const passwordInputEl = screen.getByLabelText("Password:");
  const submitButtonEl = screen.getByRole("button", { name: /submit/i });

  await user.type(usernameInputEl, "testuser");
  await user.type(passwordInputEl, "1234");
  await user.click(submitButtonEl);
}

describe("Login Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("allows a user to login", async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    await completeLoginForm();

    expect(login).toHaveBeenCalledWith("testuser", "1234");
  });
});