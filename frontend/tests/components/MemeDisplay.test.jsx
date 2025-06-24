import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import { vi } from "vitest";
import MemeDisplay from "../../src/components/MemeDisplay";

// Mock the ShareButton component
vi.mock("../../src/components/ShareButtonComponent", () => ({
  default: ({ meme }) => <button name="share">Share</button>
}));

describe("MemeDisplay", () => {
  const mockMeme = {
    _id: "507f1f77bcf86cd799439011",
    title: "Test Meme",
    img: "uploads/test.jpg",
    tags: ["funny", "test"]
  };

  it("displays a share button", () => {
    render(<MemeDisplay meme={mockMeme} />);
    
    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
  });
});