import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import '@testing-library/jest-dom';
import ShareButton from "../../src/components/ShareButtonComponent";

// Mock the share utils
vi.mock("../../src/utils/shareUtils", () => ({
  generateShareableUrl: vi.fn()
}));

import { generateShareableUrl } from "../../src/utils/shareUtils";

describe("ShareButton", () => {
  const mockMeme = {
    _id: "507f1f77bcf86cd799439011",
    title: "Test Meme",
    img: "uploads/test.jpg",
    tags: ["funny", "test"]
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("displays a share button", () => {
    render(<ShareButton meme={mockMeme} />);
    
    expect(screen.getByTestId("share-button")).toBeInTheDocument();
  });

  it("renders share button with FAB styling", () => {
    render(<ShareButton meme={mockMeme} />);
    
    const shareButton = screen.getByTestId("share-button");
    expect(shareButton).toHaveClass("share-fab-button");
    expect(shareButton).toHaveAttribute("aria-label", "Share this meme");
  });

  it("shows share dialogue when clicked", async () => {
    const user = userEvent.setup();
    
    // Mock clipboard
    const writeTextMock = vi.fn().mockResolvedValue();
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText: writeTextMock },
    });
    
    // Mock URL generation
    generateShareableUrl.mockReturnValue("http://localhost:5173/meme/507f1f77bcf86cd799439011");
    
    render(<ShareButton meme={mockMeme} />);
    
    // Check dialog isn't initially visible
    expect(screen.queryByTestId("share-dialogue")).not.toBeInTheDocument();
    
    const shareButton = screen.getByTestId("share-button");
    await user.click(shareButton);
    
    // Check dialog appears with copy option
    expect(screen.queryByTestId("share-dialogue")).toBeInTheDocument();
    const clipboardButton = screen.getByRole("button", { name: /copy/i });
    expect(clipboardButton).toBeInTheDocument();
    
    // Verify it did NOT auto-copy
    expect(writeTextMock).not.toHaveBeenCalled();
  });

  it("generates shareable URL and copies to clipboard when copy button clicked", async () => {
    const user = userEvent.setup();
    
    // Mock clipboard
    const writeTextMock = vi.fn().mockResolvedValue();
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText: writeTextMock },
    });
    
    // Mock URL generation
    generateShareableUrl.mockReturnValue("http://localhost:5173/meme/507f1f77bcf86cd799439011");
    
    render(<ShareButton meme={mockMeme} />);
    const shareButton = screen.getByTestId("share-button");
    await user.click(shareButton);
    const copyButton = screen.getByRole("button", { name: /copy/i });
    await user.click(copyButton);

    // shareable url generation
    expect(generateShareableUrl).toHaveBeenCalledWith(mockMeme);
    // copied to clipboard
    expect(writeTextMock).toHaveBeenCalledWith("http://localhost:5173/meme/507f1f77bcf86cd799439011");
    // user feedback saying "Copied!"
    expect(screen.getByText(/copied/i)).toBeInTheDocument();
  })

  it("closes dialogue when user clicks outside of share-dialogue", async () => {
    const user = userEvent.setup()
    
    // Mock clipboard
    const writeTextMock = vi.fn().mockResolvedValue();
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText: writeTextMock },
    });
    
    // Mock URL generation
    generateShareableUrl.mockReturnValue("http://localhost:5173/meme/507f1f77bcf86cd799439011");
    
    render(<ShareButton meme={mockMeme} />);
    const shareButton = screen.getByTestId("share-button");
    await user.click(shareButton);
    
    // Dialog should open
    expect(screen.queryByTestId("share-dialogue")).toBeInTheDocument();

    // Click out of the dialog
    await user.click(document.body);

    // Dialog should close
    expect(screen.queryByTestId("share-dialogue")).not.toBeInTheDocument();
  })

  it("closes dialog when Escape key is pressed", async () => {
    const user = userEvent.setup();
    
    render(<ShareButton meme={mockMeme} />);
    
    // Open dialog
    const shareButton = screen.getByRole("button", { name: /share this meme/i });
    await user.click(shareButton);
    
    expect(screen.getByTestId("share-dialogue")).toBeInTheDocument();
    
    // Press Escape key
    await user.keyboard('{Escape}');
    
    // Dialog should close
    expect(screen.queryByTestId("share-dialogue")).not.toBeInTheDocument();
  });

  it("shows all social platform buttons in dialog", async () => {
  const user = userEvent.setup();
  
  render(<ShareButton meme={mockMeme} />);
  
  // Open dialog
  const shareButton = screen.getByRole("button", { name: /share this meme/i });
  await user.click(shareButton);
  
  // Should have all 5 share options
  expect(screen.getByRole("button", { name: /copy to clipboard/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /share on whatsapp/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /share on facebook/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /share on twitter/i })).toBeInTheDocument();
});

  it("opens WhatsApp when WhatsApp button is clicked", async () => {
    const user = userEvent.setup();
    
    // Mock window.open
    const mockOpen = vi.fn();
    Object.defineProperty(window, 'open', { value: mockOpen });
    
    generateShareableUrl.mockReturnValue("http://localhost:5173/meme/123");
    
    render(<ShareButton meme={mockMeme} />);
    
    const shareButton = screen.getByRole("button", { name: /share this meme/i });
    await user.click(shareButton);
    
    const whatsappButton = screen.getByRole("button", { name: /share on whatsapp/i });
    await user.click(whatsappButton);
    
    expect(mockOpen).toHaveBeenCalledWith(
      "https://wa.me/?text=Check%20out%20this%20meme%3A%20http%3A%2F%2Flocalhost%3A5173%2Fmeme%2F123",
      "_blank"
    );
  });

  it("opens twitter when button is clicked", async () => {
    const user = userEvent.setup();
    
    // Mock window.open
    const mockOpen = vi.fn();
    Object.defineProperty(window, 'open', { value: mockOpen });
    
    generateShareableUrl.mockReturnValue("http://localhost:5173/meme/123");
    
    render(<ShareButton meme={mockMeme} />);
    
    const shareButton = screen.getByRole("button", { name: /share this meme/i });
    await user.click(shareButton);
    
    const twitterButton = screen.getByRole("button", { name: /share on Twitter/i });
    await user.click(twitterButton);
    
    expect(mockOpen).toHaveBeenCalledWith(
      "https://twitter.com/intent/tweet?text=Check%20out%20this%20hilarious%20meme!%20http%3A%2F%2Flocalhost%3A5173%2Fmeme%2F123",
      "_blank"
    );
  });
})