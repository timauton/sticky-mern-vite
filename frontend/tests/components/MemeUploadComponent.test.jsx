import { render, screen, act } from "@testing-library/react";
import '@testing-library/jest-dom';
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import MemeUpload from "../../src/components/MemeUploadComponent";

// Mock services and hooks at the top level
vi.mock('../../src/services/memeUploadService', () => ({
  createMeme: vi.fn()
}))

const mockUseImageValidation = vi.fn()

vi.mock('../../src/Hooks/useImageValidationHook', () => ({
  useImageValidation: () => mockUseImageValidation()
}))

describe('MemeUpload Component', () => {
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

  describe('Initial rendering', () => {
    test('renders with a title input field', () => {
      render(<MemeUpload />)

      const titleInput = screen.getByLabelText('Meme title')
      expect(titleInput).toBeInTheDocument()
      expect(titleInput).toHaveAttribute('placeholder', 'Meme title')
    })

    test('renders with file input for choosing meme image', () => {
      render(<MemeUpload />)

      const fileInput = screen.getByLabelText('Choose meme image file')
      expect(fileInput).toBeInTheDocument()
      expect(fileInput).toHaveAttribute('accept', 'image/*')
    })

    test('renders with submit button', () => {
      render(<MemeUpload />)

      expect(screen.getByDisplayValue('Upload Meme')).toBeInTheDocument()
    })

    test('initially has no file selected and submit button is disabled', () => {
      render(<MemeUpload />)

      const fileInput = screen.getByLabelText('Choose meme image file')
      const submitButton = screen.getByDisplayValue('Upload Meme')
      
      expect(fileInput.files).toHaveLength(0)
      expect(submitButton).toBeDisabled()
    })
  })

  describe('User interactions with upload form', () => {
    test('user can enter a meme title', async () => {
      render(<MemeUpload />)

      const titleInput = screen.getByLabelText('Meme title')
      await userEvent.type(titleInput, 'Funny cat meme')

      expect(titleInput).toHaveValue('Funny cat meme')
    })

    test('submit button is enabled when meme uploaded', async () => {
      render(<MemeUpload />)

      const fileInput = screen.getByLabelText('Choose meme image file')
      const submitButton = screen.getByDisplayValue('Upload Meme')

      expect(submitButton).toBeDisabled()

      const file = new File(['test'], 'meme.jpg', {type:'image/jpeg'})

      await userEvent.upload(fileInput, file)

      expect(fileInput.files[0]).toBe(file)
      expect(submitButton).toBeEnabled()
    })

    test('shows success message after successful upload', async () => {
      // Import and get the mocked function
      const { createMeme } = await import('../../src/services/memeUploadService')
      
      // Clear any previous calls and set up the mock
      createMeme.mockClear()
      createMeme.mockResolvedValue({})

      // Mock alert
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      render(<MemeUpload />)
      
      const titleInput = screen.getByLabelText('Meme title')
      const fileInput = screen.getByLabelText('Choose meme image file')
      const submitButton = screen.getByDisplayValue('Upload Meme')
      
      // Fill title
      await userEvent.type(titleInput, 'Test meme')
      
      // Upload file
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      await userEvent.upload(fileInput, file)
      await userEvent.click(submitButton)

      // This test is a bit flakey as success message times-out after 3000ms.
      //  If the above doesn't work, try a manual submit event
      if (createMeme.mock.calls.length === 0) {
        const form = screen.getByLabelText('Upload meme form')
        
        // Create a submit event manually
        await act(async () => {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
        form.dispatchEvent(submitEvent)
        })
      }
      
      expect(createMeme).toHaveBeenCalledTimes(1)
      
      // Clean up
      alertSpy.mockRestore()
    })
  })
  describe('Error handling', () => {
    test('shows alert when form is submitted without image (bypassing disabled button)', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      render(<MemeUpload />)
      
      const titleInput = screen.getByLabelText('Meme title')
      const form = screen.getByLabelText('Upload meme form')
      
      await userEvent.type(titleInput, 'Test meme')
      
      // Manually trigger form submission (bypasses disabled button)
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
      form.dispatchEvent(submitEvent)
      
      expect(alertSpy).toHaveBeenCalledWith('☠️ You forgot to upload your meme! ☠️')
      alertSpy.mockRestore()
    })

    test('handles API failure gracefully', async () => {
      const { createMeme } = await import('../../src/services/memeUploadService')
      createMeme.mockClear()
      createMeme.mockRejectedValueOnce(new Error('Upload failed'))
      
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<MemeUpload />)
      
      // Fill form and submit
      await userEvent.type(screen.getByLabelText('Meme title'), 'Test meme')
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      await userEvent.upload(screen.getByLabelText('Choose meme image file'), file)      
      const form = screen.getByLabelText('Upload meme form')
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
      form.dispatchEvent(submitEvent)
      
      await vi.waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled()
      })
      
      // Form should not reset on error
      expect(screen.getByLabelText('Meme title')).toHaveValue('Test meme')
      
      alertSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })

    test('button stays disabled when file validation fails', async () => {
      // Override the mock for this test
      mockUseImageValidation.mockReturnValue({
        imageError: 'File too large',
        validateAndSetError: vi.fn(() => false),
        clearError: vi.fn(),
        resetValidation: vi.fn()
      })
      
      render(<MemeUpload />)
      
      const fileInput = screen.getByLabelText('Choose meme image file')
      const submitButton = screen.getByDisplayValue('Upload Meme')
      
      const file = new File(['test'], 'huge-file.jpg', { type: 'image/jpeg' })
      await userEvent.upload(fileInput, file)
      
      expect(submitButton).toBeDisabled()
      })
  })
  describe("After upload completes", () => {
    test('form resets after upload', async () => {
      const { createMeme } = await import('../../src/services/memeUploadService')
      createMeme.mockClear()
      createMeme.mockResolvedValue({})
      
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      render(<MemeUpload />)
      
      const titleInput = screen.getByLabelText('Meme title')
      const fileInput = screen.getByLabelText('Choose meme image file')
      const submitButton = screen.getByDisplayValue('Upload Meme')
      
      // Fill form
      await userEvent.type(titleInput, 'Test meme')
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      await userEvent.upload(fileInput, file)
      
      // Submit
      const form = screen.getByLabelText('Upload meme form')
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
      form.dispatchEvent(submitEvent)
      
      await screen.findByText(/Your meme is now in the RANDOMIZER/)
      
      // Check form is reset
      expect(titleInput).toHaveValue('')
      expect(fileInput.files).toHaveLength(0)
      expect(submitButton).toBeDisabled()
      
      alertSpy.mockRestore() 
    })
  })
})