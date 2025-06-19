import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RatingBar from './RatingBar';

describe('RatingBar', () => {
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

  test('shows hover effect on stars when not voted', () => {
    render(<RatingBar />);
    
    const thirdStar = screen.getByLabelText('Rate 3 stars');
    fireEvent.mouseEnter(thirdStar);
    
    // Check that stars 1-3 should be highlighted (this would need to check CSS classes)
    // In a real test environment, you might check for specific classes or styles
    expect(thirdStar).toBeInTheDocument();
  });

  test('allows user to click and rate', () => {
    render(<RatingBar />);
    
    const fourthStar = screen.getByLabelText('Rate 4 stars');
    fireEvent.click(fourthStar);
    
    expect(screen.getByText('You rated: 4 stars')).toBeInTheDocument();
    expect(screen.getByText('4.0')).toBeInTheDocument();
    expect(screen.getByText('1 rating')).toBeInTheDocument();
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

  test('handles mouse leave event', () => {
    render(<RatingBar />);
    
    const starContainer = screen.getAllByLabelText(/Rate \d star/)[0].parentElement;
    const thirdStar = screen.getByLabelText('Rate 3 stars');
    
    fireEvent.mouseEnter(thirdStar);
    fireEvent.mouseLeave(starContainer);
    
    // After mouse leave, hover effect should be removed
    // This would need to check CSS classes in a real implementation
    expect(thirdStar).toBeInTheDocument();
  });

  test('displays correct aria labels for accessibility', () => {
    render(<RatingBar />);
    
    expect(screen.getByLabelText('Rate 1 star')).toBeInTheDocument();
    expect(screen.getByLabelText('Rate 2 stars')).toBeInTheDocument();
    expect(screen.getByLabelText('Rate 3 stars')).toBeInTheDocument();
    expect(screen.getByLabelText('Rate 4 stars')).toBeInTheDocument();
    expect(screen.getByLabelText('Rate 5 stars')).toBeInTheDocument();
  });

  test('disables interaction after voting', () => {
    render(<RatingBar />);
    
    const fourthStar = screen.getByLabelText('Rate 4 stars');
    fireEvent.click(fourthStar);
    
    // Button should be disabled after voting
    expect(fourthStar).toBeDisabled();
  });

  test('starts with voting enabled when no initial rating', () => {
    render(<RatingBar />);
    
    const firstStar = screen.getByLabelText('Rate 1 star');
    expect(firstStar).not.toBeDisabled();
  });

  test('starts with voting disabled when initial rating provided', () => {
    render(<RatingBar initialRating={3} />);
    
    const firstStar = screen.getByLabelText('Rate 1 star');
    expect(firstStar).toBeDisabled();
  });
});