import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

import  MemePage  from '../../src/pages/Meme/MemePage';
import getMeme from '../../src/services/memeSelector'

// Mocking getMeme service
vi.mock('../../src/services/memeSelector', () => ({
  default: vi.fn()
}));


describe('MemePage Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    //Mock tokens
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'fake-token')
      }, 
      writable: true
    });
  });

  describe('Initial Rendering', () => {
    it('displays a meme when given a valid meme ID', async () => {
      const mockMeme = {
        _id: "507f1f77bcf86cd799439011",
        title: "Test Meme",
        img: "uploads/test.jpg",
        user: { username: "testuser"},
        tags: ["funny", "test"]
      };

      getMeme.mockResolvedValue({
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
        expect(screen.getByText("Test Meme")).toBeInTheDocument();
      });
      
      // Verify the API was called with the right ID
      expect(getMeme).toHaveBeenCalledWith("fake-token", "507f1f77bcf86cd799439011");
    });
  });
})