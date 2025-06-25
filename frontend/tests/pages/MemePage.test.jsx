// Mock memeSelector service
vi.mock("../../src/services/memeSelector", () => ({
  default: vi.fn()
}));

// Mock Log In
vi.mock("../../src/components/Login", () => ({
  Login: () => (
    <form>
      <input aria-label="Username" />
      <input aria-label="Password" type="password" />
    </form>
  )
}));

// Mock Sign Up
vi.mock("../../src/components/Signup", () => ({
  Signup: () => (
    <form>
      <input aria-label="Username" />
      <input aria-label="Email" />
      <input aria-label="Password" type="password" />
    </form>
  )
}));

// IMPORTS

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi } from "vitest";
import '@testing-library/jest-dom';
import MemePage from "../../src/pages/Meme/MemePage";
import getMeme from "../../src/services/memeSelector"; 

describe("MemePage Component", () => {
  const mockMeme = {
    _id: "507f1f77bcf86cd799439011",
    title: "Test Meme",
    img: "uploads/test.jpg",
    user: { username: "testuser" },
    tags: ["funny", "test"]
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  //Mock tokens
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(() => 'fake-token')
    }, 
    writable: true
    });

  describe('Initial Rendering', () => {
    it('displays a meme when given a valid meme ID', async () => {
        vi.mocked(getMeme).mockResolvedValue({
          meme: mockMeme,
          token: "new-token"
        });
  
      // Act: Render the component with a specific route
      render(
        <MemoryRouter initialEntries={["/meme/507f1f77bcf86cd799439011"]}>
          <Routes>
            <Route path="/meme/:meme_id" element={<MemePage />} />
          </Routes>
        </MemoryRouter>
      );

      // Assert: Check that the meme is displayed
      await waitFor(() => {
        expect(screen.getByAltText("Test Meme")).toBeInTheDocument();
      });
      
      // Verify the API was called with the right ID
      expect(getMeme).toHaveBeenCalledWith(null, "fake-token", "507f1f77bcf86cd799439011");
    });

    it("shows tags only for authenticated users", async () => {
      vi.mocked(getMeme).mockResolvedValue({ meme: mockMeme, token: "new-token" });

      render(
        <MemoryRouter initialEntries={["/meme/507f1f77bcf86cd799439011"]}>
          <Routes>
            <Route path="/meme/:meme_id" element={<MemePage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Tagged:")).toBeInTheDocument();
        expect(screen.getByText("funny")).toBeInTheDocument();
        expect(screen.getByText("test")).toBeInTheDocument();
      });
    });

    it("shows meme to unauthenticated users", async () => {
      // Mock meme selector
      vi.mock("../services/memeSelector", () => ({
        default: vi.fn()
      }));
      
      // Mock no token in localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => null )
        }, 
        writable: true
      });

      // Mock getMeme to return meme data (without requiring auth)
      getMeme.mockResolvedValue({
        meme: mockMeme,
      });

      // Render MemePage with a specific meme ID
      render(
        <MemoryRouter initialEntries={["/meme/507f1f77bcf86cd799439011"]}>
          <Routes>
            <Route path="/meme/:meme_id" element={<MemePage />} />
          </Routes>
        </MemoryRouter>
      );

      screen.debug();

      await waitFor(() => {
        // Assert that meme content appears
        expect(screen.getByAltText("Test Meme")).toBeInTheDocument();
        
        // Assert that auth message appears
        expect(screen.getByTestId("login-prompt")).toBeInTheDocument();
        expect(screen.getByTestId("signup-prompt")).toBeInTheDocument();
        
        // Assert that auth-only features are NOT present
        expect(screen.queryByRole("button", { name: /share/i })).not.toBeInTheDocument();
        expect(screen.queryByTestId("rating-bar")).not.toBeInTheDocument();
      });
    });

    it("shows share button for authenticated users", async () => {
      // Set up authenticated localStorage
      Object.defineProperty(window, 'localStorage', {
        value: { 
          getItem: vi.fn(() => 'fake-token')  // Authenticated user
        },
        writable: true
      });

      vi.mocked(getMeme).mockResolvedValue({ 
        meme: mockMeme, 
        token: "new-token" 
      });

      render(
        <MemoryRouter initialEntries={["/meme/507f1f77bcf86cd799439011"]}>
          <Routes>
            <Route path="/meme/:meme_id" element={<MemePage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("shows 'Meme not found' when API returns 404", async () => {
      vi.mocked(getMeme).mockRejectedValue(new Error("404 Unable to fetch memes"));

      render(
        <MemoryRouter initialEntries={["/meme/nonexistent"]}>
          <Routes>
            <Route path="/meme/:meme_id" element={<MemePage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Meme not found")).toBeInTheDocument();
      });
    });

    it("shows 'Meme not found' when API returns invalid data", async () => {
      vi.mocked(getMeme).mockResolvedValue({ meme: null });

      render(
        <MemoryRouter initialEntries={["/meme/invalid"]}>
          <Routes>
            <Route path="/meme/:meme_id" element={<MemePage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Meme not found")).toBeInTheDocument();
      });
    });
  });

  describe("Loading States", () => {
    it("shows loading state initially", () => {
      // Mock a never-resolving promise to test loading state
      vi.mocked(getMeme).mockImplementation(() => new Promise(() => {}));

      render(
        <MemoryRouter initialEntries={["/meme/123"]}>
          <Routes>
            <Route path="/meme/:meme_id" element={<MemePage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      });
    });

  describe("Navigation", () => {
    it("shows 'More Memes' button for authenticated users", async () => {
      Object.defineProperty(window, 'localStorage', {
        value: { 
          getItem: vi.fn(() => 'fake-token')  // Authenticated user
        },
        writable: true
      });

      vi.mocked(getMeme).mockResolvedValue({ 
        meme: mockMeme, 
        token: "new-token" 
      });

      render(
        <MemoryRouter initialEntries={["/meme/507f1f77bcf86cd799439011"]}>
          <Routes>
            <Route path="/meme/:meme_id" element={<MemePage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("More Memes")).toBeInTheDocument();
      });
    });

    it("shows signup/login buttons for unauthenticated users", async () => {
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: vi.fn(() => null) },
        writable: true
      });

      vi.mocked(getMeme).mockResolvedValue({ meme: mockMeme });

      render(
        <MemoryRouter initialEntries={["/meme/507f1f77bcf86cd799439011"]}>
          <Routes>
            <Route path="/meme/:meme_id" element={<MemePage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Sign Up")).toBeInTheDocument();
        expect(screen.getByText("Login")).toBeInTheDocument();
      });
    });
  });
  
  describe("Interactive Login/Signup Links", () => {
    beforeEach(() => {
      // Set up unauthenticated state
      Object.defineProperty(window, 'localStorage', {
        value: { 
          getItem: vi.fn(() => null)  // Unauthenticated user
        },
        writable: true
      });
    });

    it("opens login form when 'Log in' link is clicked", async () => {
      const user = userEvent.setup();
      
      vi.mocked(getMeme).mockResolvedValue({ meme: mockMeme });

      render(
        <MemoryRouter initialEntries={["/meme/507f1f77bcf86cd799439011"]}>
          <Routes>
            <Route path="/meme/:meme_id" element={<MemePage />} />
          </Routes>
        </MemoryRouter>
      );

      // Wait for the page to load
      await waitFor(() => {
        expect(screen.getByAltText("Test Meme")).toBeInTheDocument();
      });

      // Click the "Log in" link
      const loginLink = screen.getByRole("button", { name: /log in/i });
      await user.click(loginLink);

      // Check that login form appears
      await waitFor(() => {
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      });
    });

    it("opens signup form when 'sign up' link is clicked", async () => {
      const user = userEvent.setup();
      
      vi.mocked(getMeme).mockResolvedValue({ meme: mockMeme });

      render(
        <MemoryRouter initialEntries={["/meme/507f1f77bcf86cd799439011"]}>
          <Routes>
            <Route path="/meme/:meme_id" element={<MemePage />} />
          </Routes>
        </MemoryRouter>
      );

      // Wait for the page to load
      await waitFor(() => {
        expect(screen.getByAltText("Test Meme")).toBeInTheDocument();
      });

      // Click the "sign up" link
      const signupLink = screen.getByTestId("signup-prompt");
      await user.click(signupLink);

      // Check that signup form appears
      await waitFor(() => {
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      });
    });
  });
})