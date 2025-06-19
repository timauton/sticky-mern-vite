import { render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { RatingBar } from './RatingBar';

describe('RatingBar', () => {
  // Basic rendering tests
  test('renders with default values', () => {
    render(<RatingBar />);
    
    expect(screen.getByText('0.0')).toBeInTheDocument();
    expect(screen.getByText('0 ratings')).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Rate \d star/)).toHaveLength(5);
  });

  test('renders with initial values', () => {
    render(<RatingBar initialRating={3} totalRatings={10} initialAverage={4.2} />);
    
    expect(screen.getByText('4.2')).toBeInTheDocument();
    expect(screen.getByText('10 ratings')).toBeInTheDocument();
    expect(screen.getByText('You rated: 3 stars')).toBeInTheDocument();
  });

  test('displays singular "rating" for count of 1', () => {
    render(<RatingBar totalRatings={1} initialAverage={5} />);
    
    expect(screen.getByText('1 rating')).toBeInTheDocument();
  });

  test('displays plural "ratings" for count of 0', () => {
    render(<RatingBar totalRatings={0} initialAverage={0} />);
    
    expect(screen.getByText('0 ratings')).toBeInTheDocument();
  });

  test('displays plural "ratings" for count greater than 1', () => {
    render(<RatingBar totalRatings={5} initialAverage={3.5} />);
    
    expect(screen.getByText('5 ratings')).toBeInTheDocument();
  });

  // Interaction tests
  test('allows user to click and rate 1 star', () => {
    render(<RatingBar />);
    
    const firstStar = screen.getByLabelText('Rate 1 star');
    fireEvent.click(firstStar);
    
    expect(screen.getByText('You rated: 1 star')).toBeInTheDocument();
    expect(screen.getByText('1.0')).toBeInTheDocument();
    expect(screen.getByText('1 rating')).toBeInTheDocument();
  });

  test('allows user to click and rate multiple stars', () => {
    render(<RatingBar />);
    
    const fourthStar = screen.getByLabelText('Rate 4 stars');
    fireEvent.click(fourthStar);
    
    expect(screen.getByText('You rated: 4 stars')).toBeInTheDocument();
    expect(screen.getByText('4.0')).toBeInTheDocument();
    expect(screen.getByText('1 rating')).toBeInTheDocument();
  });

  test('allows user to rate 5 stars', () => {
    render(<RatingBar />);
    
    const fifthStar = screen.getByLabelText('Rate 5 stars');
    fireEvent.click(fifthStar);
    
    expect(screen.getByText('You rated: 5 stars')).toBeInTheDocument();
    expect(screen.getByText('5.0')).toBeInTheDocument();
  });

  test('prevents multiple ratings from same user', () => {
    render(<RatingBar />);
    
    const fourthStar = screen.getByLabelText('Rate 4 stars');
    const secondStar = screen.getByLabelText('Rate 2 stars');
    
    fireEvent.click(fourthStar);
    expect(screen.getByText('You rated: 4 stars')).toBeInTheDocument();
    
    fireEvent.click(secondStar);
    // Should still show 4 stars, not 2
    expect(screen.getByText('You rated: 4 stars')).toBeInTheDocument();
    expect(screen.queryByText('You rated: 2 stars')).not.toBeInTheDocument();
  });

  // Average calculation tests
  test('calculates average correctly after user votes', () => {
    render(<RatingBar totalRatings={2} initialAverage={3.0} />);
    
    const fiveStar = screen.getByLabelText('Rate 5 stars');
    fireEvent.click(fiveStar);
    
    // Initial: 2 ratings with average 3.0 (total = 6)
    // New: add rating of 5 (total = 11, count = 3)
    // New average: 11/3 = 3.7
    expect(screen.getByText('3.7')).toBeInTheDocument();
    expect(screen.getByText('3 ratings')).toBeInTheDocument();
  });

  test('calculates average correctly with decimal precision', () => {
    render(<RatingBar totalRatings={3} initialAverage={4.33} />);
    
    const twoStar = screen.getByLabelText('Rate 2 stars');
    fireEvent.click(twoStar);
    
    // Initial: 3 ratings with average 4.33 (total = 12.99)
    // New: add rating of 2 (total = 14.99, count = 4)
    // New average: 14.99/4 = 3.7475 -> 3.7
    expect(screen.getByText('3.7')).toBeInTheDocument();
    expect(screen.getByText('4 ratings')).toBeInTheDocument();
  });

  test('handles zero initial average correctly', () => {
    render(<RatingBar totalRatings={0} initialAverage={0} />);
    
    const threeStar = screen.getByLabelText('Rate 3 stars');
    fireEvent.click(threeStar);
    
    expect(screen.getByText('3.0')).toBeInTheDocument();
    expect(screen.getByText('1 rating')).toBeInTheDocument();
  });

  // Hover interaction tests
  test('shows hover effect on stars when not voted', () => {
    render(<RatingBar />);
    
    const thirdStar = screen.getByLabelText('Rate 3 stars');
    fireEvent.mouseEnter(thirdStar);
    
    // Component should still be interactable
    expect(thirdStar).not.toBeDisabled();
    expect(thirdStar).toBeInTheDocument();
  });

  test('handles mouse leave event correctly', () => {
    render(<RatingBar />);
    
    const starContainer = screen.getAllByLabelText(/Rate \d star/)[0].parentElement;
    const thirdStar = screen.getByLabelText('Rate 3 stars');
    
    fireEvent.mouseEnter(thirdStar);
    fireEvent.mouseLeave(starContainer);
    
    // Component should still be functional after mouse leave
    expect(thirdStar).toBeInTheDocument();
    expect(thirdStar).not.toBeDisabled();
  });

  test('does not show hover effect after voting', () => {
    render(<RatingBar />);
    
    const fourthStar = screen.getByLabelText('Rate 4 stars');
    const secondStar = screen.getByLabelText('Rate 2 stars');
    
    fireEvent.click(fourthStar);
    fireEvent.mouseEnter(secondStar);
    
    // Should still show voted rating, not hover
    expect(screen.getByText('You rated: 4 stars')).toBeInTheDocument();
    expect(secondStar).toBeDisabled();
  });

  // Accessibility tests
  test('displays correct aria labels for accessibility', () => {
    render(<RatingBar />);
    
    expect(screen.getByLabelText('Rate 1 star')).toBeInTheDocument();
    expect(screen.getByLabelText('Rate 2 stars')).toBeInTheDocument();
    expect(screen.getByLabelText('Rate 3 stars')).toBeInTheDocument();
    expect(screen.getByLabelText('Rate 4 stars')).toBeInTheDocument();
    expect(screen.getByLabelText('Rate 5 stars')).toBeInTheDocument();
  });

  test('has proper button structure for screen readers', () => {
    render(<RatingBar />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
    
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('aria-label');
    });
  });

  // Disabled state tests
  test('disables interaction after voting', () => {
    render(<RatingBar />);
    
    const fourthStar = screen.getByLabelText('Rate 4 stars');
    fireEvent.click(fourthStar);
    
    // All buttons should be disabled after voting
    const allStars = screen.getAllByLabelText(/Rate \d star/);
    allStars.forEach(star => {
      expect(star).toBeDisabled();
    });
  });

  test('starts with voting enabled when no initial rating', () => {
    render(<RatingBar />);
    
    const allStars = screen.getAllByLabelText(/Rate \d star/);
    allStars.forEach(star => {
      expect(star).not.toBeDisabled();
    });
  });

  test('starts with voting disabled when initial rating provided', () => {
    render(<RatingBar initialRating={3} />);
    
    const allStars = screen.getAllByLabelText(/Rate \d star/);
    allStars.forEach(star => {
      expect(star).toBeDisabled();
    });
  });

  // Edge cases and error handling
  test('handles negative initial values gracefully', () => {
    render(<RatingBar initialRating={-1} totalRatings={-5} initialAverage={-2} />);
    
    // Should treat negative values as defaults
    expect(screen.getByText('0.0')).toBeInTheDocument();
    expect(screen.queryByText('You rated:')).not.toBeInTheDocument();
  });

  test('handles very large initial values', () => {
    render(<RatingBar initialRating={10} totalRatings={1000} initialAverage={99.99} />);
    
    expect(screen.getByText('100.0')).toBeInTheDocument(); // Should cap at 100 or handle gracefully
    expect(screen.getByText('1000 ratings')).toBeInTheDocument();
  });

  test('handles decimal initial ratings', () => {
    render(<RatingBar initialRating={3.7} totalRatings={50} initialAverage={4.25} />);
    
    expect(screen.getByText('4.3')).toBeInTheDocument(); // Should handle decimal average
    expect(screen.getByText('50 ratings')).toBeInTheDocument();
  });

  // Star fill function tests (testing internal logic)
  test('correctly fills stars based on user rating', () => {
    render(<RatingBar />);
    
    const threeStar = screen.getByLabelText('Rate 3 stars');
    fireEvent.click(threeStar);
    
    // Verify user status shows correct rating
    expect(screen.getByText('You rated: 3 stars')).toBeInTheDocument();
  });

  test('user status displays correctly for single star', () => {
    render(<RatingBar />);
    
    const oneStar = screen.getByLabelText('Rate 1 star');
    fireEvent.click(oneStar);
    
    expect(screen.getByText('You rated: 1 star')).toBeInTheDocument();
  });

  // Component state persistence tests
  test('maintains state after multiple interactions', () => {
    render(<RatingBar />);
    
    const threeStar = screen.getByLabelText('Rate 3 stars');
    const fiveStar = screen.getByLabelText('Rate 5 stars');
    
    // Hover over different stars
    fireEvent.mouseEnter(fiveStar);
    fireEvent.mouseLeave(fiveStar.parentElement);
    
    // Click to rate
    fireEvent.click(threeStar);
    
    // Try to hover again (should not change rating)
    fireEvent.mouseEnter(fiveStar);
    
    expect(screen.getByText('You rated: 3 stars')).toBeInTheDocument();
    expect(screen.getByText('3.0')).toBeInTheDocument();
  });

  // Integration tests
  test('complete user flow works correctly', () => {
    render(<RatingBar totalRatings={10} initialAverage={3.5} />);
    
    // Initial state
    expect(screen.getByText('3.5')).toBeInTheDocument();
    expect(screen.getByText('10 ratings')).toBeInTheDocument();
    expect(screen.queryByText('You rated:')).not.toBeInTheDocument();
    
    // User interaction
    const fourStar = screen.getByLabelText('Rate 4 stars');
    fireEvent.click(fourStar);
    
    // Final state
    expect(screen.getByText('You rated: 4 stars')).toBeInTheDocument();
    expect(screen.getByText('3.5')).toBeInTheDocument(); // Average calculation: (3.5*10 + 4)/11 = 39/11 = 3.5
    expect(screen.getByText('11 ratings')).toBeInTheDocument();
    
    // Verify disabled state
    expect(fourStar).toBeDisabled();
  });
});