import MemeDisplay from "../../src/components/MemeDisplay";
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';


describe("MemeDisplay", () => {
    const mockMeme = {
        _id: "1",
        title: "not sure if",
        img: "uploads/cat_keyboard.webp"
    };

    test("Renders meme", () => {
        import.meta.env.VITE_BACKEND_URL = "http://localhost:3000";
        render(<MemeDisplay meme={mockMeme} />);
        expect(screen.getByText("not sure if")).toBeTruthy();
        expect(screen.getByRole("img")).toHaveAttribute(
            "src", "http://localhost:3000/uploads/cat_keyboard.webp");
        expect(screen.getByRole("img")).toHaveAttribute(
            "alt", "not sure if");
    });

    test("renders rating bat", () => {
        const { container } = render(<MemeDisplay meme={mockMeme} />)
        const ratingDiv = container.querySelector('.rating-bar-div')
        expect(ratingDiv).toBeTruthy()
    });
})