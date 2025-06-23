import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import RatingBar from "../../src/components/RatingBar";

describe("RatingBar", () => {
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

    test("Handles star click when user hasn't voted", () => {
        render(<RatingBar totalRatings={5} initialAverage={3.0} />);

        const thirdStar = screen.getByRole("button", { name: "Rate 3 stars" });
        fireEvent.click(thirdStar);

        const hasVotedIndicator = screen.getByText((_, element) =>
            element?.classList.contains("has-voted") &&
            element?.textContent.replace(/\s+/g, "") === "AverageRating"
        );
        const newAverageRating = screen.getByText("3.0");
        const stars = screen.getAllByRole("button");

        expect(hasVotedIndicator).toBeDefined();
        expect(newAverageRating).toBeDefined();
        expect(stars[0].disabled).toBe(true);
        expect(stars[2].disabled).toBe(true);
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

    test("Calculates new average rating correctly after vote", () => {
        render(<RatingBar totalRatings={2} initialAverage={4.0} />);

        const fiveStarButton = screen.getByRole("button", { name: "Rate 5 stars" });
        fireEvent.click(fiveStarButton);

        // Original: (4.0 * 2) + 5 = 13, divided by 3 = 4.3
        const newAverageRating = screen.getByText("4.3");
        expect(newAverageRating).toBeDefined();
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

    test("All props work together correctly", () => {
        render(<RatingBar initialRating={0} totalRatings={0} initialAverage={0} />);

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
        
        const newHasVotedIndicator = screen.getByText((_, element) =>
  element?.classList.contains("has-voted") && element?.textContent.includes("Average")
);
        expect(newHasVotedIndicator).toBeDefined();
        expect(stars[3].disabled).toBe(true);
    });
});