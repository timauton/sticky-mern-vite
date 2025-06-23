import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";

import { signup } from "../../src/services/authentication";
import { Signup } from "../../src/components/Signup"; // Adjust path as needed

// Mocking the signup service
vi.mock("../../src/services/authentication", () => {
  const signupMock = vi.fn();
  return { signup: signupMock };
});

// Reusable function for filling out signup form
async function completeSignupForm() {
  const user = userEvent.setup();

  const usernameInputEl = screen.getByLabelText("Username:");
  const emailInputEl = screen.getByLabelText("Email:");
  const passwordInputEl = screen.getByLabelText("Password:");
  const submitButtonEl = screen.getByRole("button", { name: /submit/i });

  await user.type(usernameInputEl, "testuser");
  await user.type(emailInputEl, "test@email.com");
  await user.type(passwordInputEl, "1234");
  await user.click(submitButtonEl);
}

describe("Signup Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("allows a user to signup", async () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    await completeSignupForm();

    expect(signup).toHaveBeenCalledWith("testuser", "1234", "test@email.com");
  });
});