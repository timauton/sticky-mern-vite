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
import { use } from "react";

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
    
    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
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
    
    const shareButton = screen.getByRole("button", { name: /share/i });
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
    const shareButton = screen.getByRole("button", { name: /share/i });
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
    const shareButton = screen.getByRole("button", { name: /share/i });
    await user.click(shareButton);
    
    // Dialog should open
    expect(screen.queryByTestId("share-dialogue")).toBeInTheDocument();

    // Click out of the dialog
    await user.click(document.body);

    // Dialog should close
    expect(screen.queryByTestId("share-dialogue")).not.toBeInTheDocument();

  })
})