import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import { HomePage } from "../../src/pages/Home/HomePage";

// Mock getMeme to prevent 401s
vi.mock("../../src/services/memeSelector", () => ({
  default: vi.fn().mockResolvedValue({ meme: { _id: "123", url: "/fake.jpg", tags: ["games", "cats"] },
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

vi.mock("../../src/components/Signup", () => ({
  Signup: ({onSignupSuccess}) => (
    <div data-testid="signup-form">
      <label htmlFor="email">Email</label>
      <input id="email" />
      <button onClick={onSignupSuccess}>Signup Submit</button>
    </div>
  )
}));

vi.mock("../../src/components/MemeDisplay", () => ({
  default: ({ meme }) => (
    <div data-testid="meme-display">
      {meme.url && <img src={meme.url} alt="meme" />}
    </div>
  )
}));

vi.mock("../../src/components/TagFilter", () => ({
  TagFilter: ({ onTagChange }) => (
    <div data-testid="tag-filter">
      <button onClick={() => onTagChange(["funny"])}>Filter Tags</button>
    </div>
  )
}));

vi.mock("../../src/services/commentsService", () => ({
  getComments: vi.fn().mockResolvedValue([
    {
      id: 1,
      comment: "Nice meme!",
      user_id: {
        username: "Alice"
      }
    },
    {
      id: 2,
      comment: "LOL",
      user_id: {
        username: "Bob"
      }
    }
  ])
}));

vi.mock("../../src/components/Comments", () => ({
  default: () => <div data-testid="comment-box">Comment Box</div>
}))

vi.mock("../../src/components/MemeUploadButtonComponent", () => ({
  default: () => <button data-testid="meme-upload">Upload Meme</button>
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});


describe("Home Page", () => {
  beforeEach(() => {
    localStorage.clear(); 
    vi.clearAllMocks();
  });

  // LOGGED OUT STATE TESTS
  describe("When logged out", () => {
    test("renders login/signu interface", () => {
      render(
        <BrowserRouter>
        <HomePage />
      </BrowserRouter>
      );
      expect(screen.getByText("Sticky Memes")).toBeDefined();
      expect(screen.getByRole("button", { name: /sign up/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /login/i })).toBeDefined();
      expect(screen.getByAltText("the archives")).toBeDefined();
    });

    test("Signup form shows when clicking sign up button", () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
        );
      fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
      // Check for a field unique to Signup form, e.g. email input:
      expect(screen.getByTestId("signup-form")).toBeDefined();
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
      expect(screen.getByTestId("login-form")).toBeDefined();
      expect(screen.getByLabelText(/username/i)).toBeDefined();
    });

    test("hides signup form when login button is clicked", () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );
      fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
      expect(screen.getByTestId("signup-form")).toBeDefined();
      fireEvent.click(screen.getByRole("button", { name: /login/i }));
      expect(screen.queryByTestId("signup-form")).toBeNull();
      expect(screen.getByTestId("login-form")).toBeDefined();
    });

    test("hides login form when signup button is clicked", () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );
      fireEvent.click(screen.getByRole("button", { name: /login/i }));
      expect(screen.getByTestId("login-form")).toBeDefined();

      fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
      expect(screen.queryByTestId("login-form")).toBeNull();
      expect(screen.getByTestId("signup-form")).toBeDefined();
    });    

    test("shows login form after successful signup", () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );
      fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
      fireEvent.click(screen.getByText("Signup Submit"));
      expect(screen.queryByTestId("signup-form")).toBeNull();
      expect(screen.getByTestId("login-form")).toBeDefined();
    });
  });


  // LOGGED IN STATE TESTS
  describe("When logged in", () => {
    beforeEach(() => {
      localStorage.setItem("token", "fake-token");
    });

    test("renders logged in interface", async () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );
      await waitFor(() => {
        expect(screen.getByText("Sticky Memes")).toBeDefined();
        expect(screen.getByRole("button", { name: /filter memes/i })).toBeDefined();
        expect(screen.getByRole("button", { name: /log out/i })).toBeDefined();
        expect(screen.getByTestId("meme-display")).toBeDefined();
        expect(screen.getByTestId("comment-box")).toBeDefined();
        expect(screen.getByTestId("meme-upload")).toBeDefined();
      });
    });

    test("shows meme tags", async () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );
      await waitFor(() => {
        expect(screen.getByText("Tags for this meme:")).toBeDefined();
        expect(screen.getByText("games")).toBeDefined();
        expect(screen.getByText("cats")).toBeDefined();
      });
    });

    test("shows tag filter when filter button is clicked", async () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );
      await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: /filter memes/i }));
        expect(screen.getByTestId("tag-filter")).toBeDefined();
      });
    });

    test("hites tag filter when filter button is clicked again", async () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );
      await waitFor(() => {
        const filterButton = screen.getByRole("button", { name: /filter memes/i });
        fireEvent.click(filterButton);
        expect(screen.getByTestId("tag-filter")).toBeDefined();
        fireEvent.click(filterButton);
        expect(screen.queryByTestId("tag-filter")).toBeNull();
      });
    });

    test("logs out user when logout button is clicked", async () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );
      await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: /log out/i }));
      });
      expect(screen.getByRole("button", { name: /sign up/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /login/i })).toBeDefined();
      expect(localStorage.getItem("token")).toBeNull();
    });

    test("navigates to stats page when My Stats button is clicked", async () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );
      await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: /my\s+stats/i }));
        expect(mockNavigate).toHaveBeenCalledWith("/stats");
      });
    });

    test("loads meme on mount when logged in", async () => {
      const getMeme = await import("../../src/services/memeSelector");
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );
      await waitFor(() => {
        expect(getMeme.default).toHaveBeenCalledWith("", "fake-token", "next");
      });
    });

    test("back button exists initially", async () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );
      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        const backButton = buttons.find(btn => {
          const img = btn.querySelector('img[src="./left-arrow.png"]');
          return img !== null;
        });
        expect(backButton).toBeDefined();
      });
    });

    test("shows next button and handles next meme click", async () => {
      const getMeme = await import("../../src/services/memeSelector");
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );
      await waitFor(() => {
        const nextButton = document.querySelector(".back-and-forth.right"); // Right arrow button
        fireEvent.click(nextButton);
        
        expect(getMeme.default).toHaveBeenCalledWith("", expect.any(String), "next");
      });
    });

    test("successful login transitions to logged in state", () => {
      localStorage.clear(); // Start logged out
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );
      fireEvent.click(screen.getByRole("button", { name: /login/i }));
      fireEvent.click(screen.getByText("Login Submit"));
      // Should now show logged in interface
      expect(screen.getByRole("button", { name: /filter memes/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /log out/i })).toBeDefined();
    });
  });

  // ERROR HANDLING TESTS
  describe("Error handling", () => {
    test("handles getMeme failure gracefully", async () => {
      localStorage.setItem("token", "fake-token");
      const getMeme = await import("../../src/services/memeSelector");
      getMeme.default.mockRejectedValueOnce(new Error("API Error"));
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      // Should not crash the component
      expect(screen.getByText("Sticky Memes")).toBeDefined();
    });

    test("handles empty meme tags array", async () => {
      localStorage.setItem("token", "fake-token");
      const getMeme = await import("../../src/services/memeSelector");
      getMeme.default.mockResolvedValueOnce({
        meme: { _id: "123", url: "/fake.jpg", tags: [] },
        token: "new-token"
      });

      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Tags for this meme:")).toBeDefined();
      });
    });

    test("handles non-array meme tags", async () => {
      localStorage.setItem("token", "fake-token");
      const getMeme = await import("../../src/services/memeSelector");
      getMeme.default.mockResolvedValueOnce({
        meme: { _id: "123", url: "/fake.jpg", tags: null },
        token: "new-token"
      });

      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Tags for this meme:")).toBeDefined();
      });
    });
  });
});