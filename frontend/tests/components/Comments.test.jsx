import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import Comments from "../../src/components/Comments";

// Mock the comments service
vi.mock('../../src/services/commentsService', () => ({
  getComments: vi.fn(),
  createComment: vi.fn(),
}));

import * as commentsService from '../../src/services/commentsService';


describe("Comments", () => {
  const mockMeme = {
    _id: "12345",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() => "fake-token"),
        setItem: vi.fn(),
      },
      writable: true,
    });
  });

  test("Initial render with no comments", async () => {
    commentsService.getComments.mockResolvedValueOnce([]);
    render(<Comments meme={mockMeme} />);
    expect(screen.getByPlaceholderText("Write a comment...")).toBeDefined();
    expect(screen.getByRole("button", { name: /submit/i })).toBeDefined();
    await waitFor(() => {
      expect(commentsService.getComments).toHaveBeenCalledWith(mockMeme._id);
    });
    const commentItems = screen.queryAllByTestId("comment-item");
    expect(commentItems).toHaveLength(0);
  });

  test("Fetches and displays comments on load", async () => {
    const mockComments = [
      { id: "1", comment: "Nice!", user_id: { username: "Alice" } },
      { id: "2", comment: "Cool meme", user_id: { username: "Bob" } },
    ];
    commentsService.getComments.mockResolvedValueOnce(mockComments);
    render(<Comments meme={mockMeme} />);
    await waitFor(() => {
      mockComments.forEach(({ comment, user_id }) => {
        expect(screen.getByText(`${comment} #${user_id.username}`)).toBeDefined();
      });
    });
  });

  test("Allows user to type a comment", () => {
    commentsService.getComments.mockResolvedValueOnce([]);
    render(<Comments meme={mockMeme} />);
    const textarea = screen.getByPlaceholderText("Write a comment...");
    fireEvent.change(textarea, { target: { value: "Great meme!" } });
    expect(textarea.value).toBe("Great meme!");
  });

  test("Submits a valid comment and clears the input", async () => {
    commentsService.getComments.mockResolvedValueOnce([]);
    const newComment = {
      comment: { id: "3", comment: "Awesome!", user_id: { username: "Charlie" } },
    };
    commentsService.createComment.mockResolvedValueOnce(newComment);
    render(<Comments meme={mockMeme} />);
    const textarea = screen.getByPlaceholderText("Write a comment...");
    const button = screen.getByRole("button", { name: /submit/i });
    fireEvent.change(textarea, { target: { value: "Awesome!" } });
    fireEvent.click(button);
    await waitFor(() => {
      expect(commentsService.createComment).toHaveBeenCalledWith(mockMeme._id, "Awesome!");
      expect(screen.getByText("Awesome! #Charlie")).toBeDefined();
      expect(textarea.value).toBe("");
    });
  });

  test("Prevents submitting an empty comment", async () => {
    commentsService.getComments.mockResolvedValueOnce([]);
    commentsService.createComment.mockResolvedValueOnce(null);
    render(<Comments meme={mockMeme} />);
    const button = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(button);
    await waitFor(() => {
      expect(commentsService.createComment).not.toHaveBeenCalled();
    });
  });

  test("Handles createComment errors gracefully", async () => {
    commentsService.getComments.mockResolvedValueOnce([]);
    commentsService.createComment.mockRejectedValueOnce(new Error("Failed to post comment"));
    render(<Comments meme={mockMeme} />);
    const textarea = screen.getByPlaceholderText("Write a comment...");
    fireEvent.change(textarea, { target: { value: "Failing comment" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(commentsService.createComment).toHaveBeenCalled();
    });
    expect(textarea.value).toBe("Failing comment");
  });

  test("Handles getComments failure smoothly", async () => {
    commentsService.getComments.mockRejectedValueOnce(new Error("Failed to fetch comments"));
    render(<Comments meme={mockMeme} />);
    await waitFor(() => {
      expect(commentsService.getComments).toHaveBeenCalled();
    });
    const items = screen.queryAllByTestId("comment-item");
    expect(items).toHaveLength(0); // nothing rendered
  });

  test("Renders newly added comment at the top of the list", async () => {
    const initialComments = [
      { id: "5", comment: "Older comment", user_id: { username: "OldUser" } },
    ];
    commentsService.getComments.mockResolvedValueOnce(initialComments);
    commentsService.createComment.mockResolvedValueOnce({
      comment: { id: "6", comment: "Newest comment", user_id: { username: "NewUser" } },
    });
    render(<Comments meme={mockMeme} />);
    await waitFor(() => {
      expect(screen.getByText("Older comment #OldUser")).toBeDefined();
    });
    const textarea = screen.getByPlaceholderText("Write a comment...");
    fireEvent.change(textarea, { target: { value: "Newest comment" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      const allComments = screen.getAllByText(/#/, { exact: false });
      expect(allComments[0].textContent).toBe("Older comment #OldUser");
    });
  });
});