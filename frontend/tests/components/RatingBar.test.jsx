import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import RatingBar from "../../src/components/RatingBar";

// Mock ratings service
vi.mock('../../src/services/ratingsService', () => ({
    getAllRatingStats: vi.fn(),
    getUserRating: vi.fn(),
    submitUserRating: vi.fn(),
}));

import * as ratingService from '../../src/services/ratingsService';

describe("RatingBar", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        //Mock token
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: vi.fn(() => 'fake-token'),
                setItem: vi.fn(),
            },
            writable: true
        });
    });

    test("Renders with default props", () => {
        render(<RatingBar />);

        const averageRating = screen.getByText("0.0");
        const stars = screen.getAllByRole("button");

        expect(averageRating).toBeDefined();
        expect(stars).toHaveLength(5);
        expect(stars[0].getAttribute("aria-label")).toBe("Rate 1 star");
        expect(stars[1].getAttribute("aria-label")).toBe("Rate 2 stars");
    });

    test("Renders with initial props correctly", () => {
        render(<RatingBar initialRating={3} totalRatings={10} initialAverage={4.2} />);

        const averageRating = screen.getByText("4.2");
        const hasVotedIndicator = screen.getByText((_, element) =>
            element?.classList.contains("has-voted") &&
            element?.textContent.replace(/\s+/g, "") === "AverageRating"
        );
        const stars = screen.getAllByRole("button");

        expect(averageRating).toBeDefined();
        expect(hasVotedIndicator).toBeDefined();
        expect(stars[0].disabled).toBe(true);
        expect(stars[4].disabled).toBe(true);
    });

    test("Handles star click when user hasn't voted", async () => {
        // Mock the service calls for this specific test
        ratingService.submitUserRating.mockResolvedValue({ rating: 3 });
        ratingService.getAllRatingStats.mockResolvedValue({
            averageRating: 3.0,
            totalRatings: 6
        });

        render(<RatingBar totalRatings={5} initialAverage={3.0} />);

        const thirdStar = screen.getByRole("button", { name: "Rate 3 stars" });
        fireEvent.click(thirdStar);

        // Wait for ALL the async changes to happen
        await waitFor(() => {
            // Check that the "has voted" indicator appears
            const hasVotedIndicator = screen.getByText((_, element) =>
                element?.classList.contains("has-voted") &&
                element?.textContent.replace(/\s+/g, "") === "AverageRating"
            );
            expect(hasVotedIndicator).toBeDefined();

            // Check that the average rating is still displayed
            const newAverageRating = screen.getByText("3.0");
            expect(newAverageRating).toBeDefined();

            // Check that stars are now disabled
            const stars = screen.getAllByRole("button");
            expect(stars[0].disabled).toBe(true);
            expect(stars[2].disabled).toBe(true);
        });
});

    test("Prevents multiple votes from same user", () => {
        render(<RatingBar initialRating={4} totalRatings={8} initialAverage={3.5} />);

        const firstStar = screen.getByRole("button", { name: "Rate 1 star" });
        const fifthStar = screen.getByRole("button", { name: "Rate 5 stars" });

        fireEvent.click(firstStar);
        fireEvent.click(fifthStar);

        const averageRating = screen.getByText("3.5");
        expect(averageRating).toBeDefined();
        expect(firstStar.disabled).toBe(true);
        expect(fifthStar.disabled).toBe(true);
    });

    test("Updates display with new average after successful vote", async () => {
        // Mock what happens after voting
        ratingService.submitUserRating.mockResolvedValue({ rating: 5 });
        ratingService.getAllRatingStats.mockResolvedValue({
            averageRating: 3.7,  // Any different value to show it updated
            totalRatings: 6
        });

        render(<RatingBar totalRatings={5} initialAverage={3.0} />);

        const fiveStarButton = screen.getByRole("button", { name: "Rate 5 stars" });
        fireEvent.click(fiveStarButton);

        await waitFor(() => {
            // Test that the display updates (not the specific calculation)
            const updatedRating = screen.getByText("3.7");
            expect(updatedRating).toBeDefined();
            
            // Also test the behavioral changes
            expect(fiveStarButton.disabled).toBe(true);
        });
    });

    test("Handles mouse hover events when user hasn't voted", () => {
        render(<RatingBar />);

        const thirdStar = screen.getByRole("button", { name: "Rate 3 stars" });
        const starContainer = screen.getByRole("button", { name: "Rate 3 stars" }).closest('.star-box');

        fireEvent.mouseEnter(thirdStar);
        // Mouse hover effects are visual (CSS classes), so we check the star is still clickable
        expect(thirdStar.disabled).toBe(false);

        if (starContainer) {
            fireEvent.mouseLeave(starContainer);
        }
        expect(thirdStar.disabled).toBe(false);
    });

    test("Ignores hover events after user has voted", () => {
        render(<RatingBar initialRating={2} totalRatings={5} initialAverage={3.0} />);

        const fourthStar = screen.getByRole("button", { name: "Rate 4 stars" });
        fireEvent.mouseEnter(fourthStar);

        // Stars should remain disabled after voting
        expect(fourthStar.disabled).toBe(true);
    });

    test("Displays correct aria-labels for all stars", () => {
        render(<RatingBar />);

        const oneStar = screen.getByRole("button", { name: "Rate 1 star" });
        const twoStars = screen.getByRole("button", { name: "Rate 2 stars" });
        const threeStars = screen.getByRole("button", { name: "Rate 3 stars" });
        const fourStars = screen.getByRole("button", { name: "Rate 4 stars" });
        const fiveStars = screen.getByRole("button", { name: "Rate 5 stars" });

        expect(oneStar).toBeDefined();
        expect(twoStars).toBeDefined();
        expect(threeStars).toBeDefined();
        expect(fourStars).toBeDefined();
        expect(fiveStars).toBeDefined();
    });

    test("Shows average rating display when user has voted", () => {
        render(<RatingBar initialRating={5} totalRatings={10} initialAverage={4.5} />);

        const averageLabel = screen.getByText((_, element) =>
            element?.classList.contains("has-voted") &&
            element?.textContent.includes("Average")
        );
        const ratingLabel = screen.getByText((_, element) =>
            element?.classList.contains("has-voted") &&
            element?.textContent.includes("Rating")
        );
        const averageValue = screen.getByText("4.5");

        expect(averageLabel).toBeDefined();
        expect(ratingLabel).toBeDefined();
        expect(averageValue).toBeDefined();
    });

    test("Hides average rating display when user hasn't voted", () => {
        render(<RatingBar totalRatings={5} initialAverage={3.2} />);

        const averageLabel = screen.queryByText((_, element) =>
            element?.classList.contains("has-voted") &&
            element?.textContent.includes("Average")
        );
        const ratingLabel = screen.queryByText("Rating");
        const averageValue = screen.getByText("3.2");

        expect(averageLabel).toBeNull();
        expect(ratingLabel).toBeNull();
        expect(averageValue).toBeDefined();
    });

    test("All props work together correctly", async () => {
        // Add mocks for this specific test
        ratingService.submitUserRating.mockResolvedValue({ rating: 4 });
        ratingService.getAllRatingStats.mockResolvedValue({
            averageRating: 4.0,
            totalRatings: 1
        });
        
        render(<RatingBar/>);

        const averageRating = screen.getByText("0.0");
        const stars = screen.getAllByRole("button");
        const hasVotedIndicator = screen.queryByText("Average");

        expect(averageRating).toBeDefined();
        expect(stars).toHaveLength(5);
        expect(hasVotedIndicator).toBeNull();
        expect(stars[0].disabled).toBe(false);
        expect(stars[4].disabled).toBe(false);

        // Test voting functionality
        fireEvent.click(stars[3]);
        
        await waitFor(() => {
        const newHasVotedIndicator = screen.getByText((_, element) =>
  element?.classList.contains("has-voted") && element?.textContent.includes("Average")
);
        expect(newHasVotedIndicator).toBeDefined();
        expect(stars[3].disabled).toBe(true);
        });
    });
});