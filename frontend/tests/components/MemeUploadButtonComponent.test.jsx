import { render, screen, act } from "@testing-library/react";
import '@testing-library/jest-dom';
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import MemeUploadButton from "../../src/components/MemeUploadButtonComponent";

// Mock services and hooks at the top level
vi.mock('../../src/services/memeUploadService', () => ({
  createMeme: vi.fn()
}))

const mockUseImageValidation = vi.fn()

vi.mock('../../src/Hooks/useImageValidationHook', () => ({
  useImageValidation: () => mockUseImageValidation()
}))

// Mock for memeSelector to prevent unhandled rejection
vi.mock('../../src/services/memeSelector', () => ({
  getMeme: vi.fn(() => Promise.resolve([]))
}))

describe('MemeUploadButton Component', () => {
  // Setup localStorage mock before each test
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'fake-token')
      },
      writable: true
    })
  })

  // Set default mock behaviour
  beforeEach(() => {
    // Set default mock behavior
    mockUseImageValidation.mockReturnValue({
      imageError: null,
      validateAndSetError: vi.fn(() => true),
      clearError: vi.fn(),
      resetValidation: vi.fn()
    })
  })

  describe('basic rendering', () => {

    test('initially renders with a +', () => {
      render(<MemeUploadButton />)

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('+');
    })

    test('renders with a - after being clicked', async () => {
      const user = userEvent.setup()
      render(<MemeUploadButton />)

      const button = screen.getByRole('button');
      await user.click(button);
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('-');
    })

  })

})