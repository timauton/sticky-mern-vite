import { renderHook, act, waitFor } from '@testing-library/react';
import { useImageValidation } from '../../src/Hooks/useImageValidationHook';

test('validates valid image correctly', () => {
    const { result } = renderHook(() => useImageValidation());
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg'});
    Object.defineProperty(validFile, 'size', { value: 1024 * 1024 });

    act(() => {
        const isValid = result.current.validateAndSetError(validFile);
        expect(isValid).toBe(true);
        expect(result.current.imageError).toBe(null);
    })

})

test('throws error for wrong file-type correctly', async () => {
    const { result } = renderHook(() => useImageValidation());
    const invalidFile = new File(['test'], 'test.psd', { type: 'image/psd'});

    act(() => {
        const isValid = result.current.validateAndSetError(invalidFile);
        expect(isValid).toBe(false);
    });
    await waitFor(() => {
        expect(result.current.imageError).toBe('Only JPEG, JPG, PNG, GIF, WEBP images are allowed');
    })
});

test('throws error for oversized file', async () => {
    const { result } = renderHook(() => useImageValidation({
        maxSize: 1 * 1024 * 1024 // 1MB limit
    }));

    // Create a 2MB file (larger than limit)
    const largeFile = new File(['test content'], 'large.jpg', { type: 'image/jpeg' });
    Object.defineProperty(largeFile, 'size', { value: 2 * 1024 * 1024 }); // 2MB

    act(() => {
        const isValid = result.current.validateAndSetError(largeFile);
        expect(isValid).toBe(false);
    });

    await waitFor(() => {
        expect(result.current.imageError).toBe('File size must be less than 1MB');
    });
});

test('throws error for non-image file type', async () => {
    const { result } = renderHook(() => useImageValidation());
    const textFile = new File(['document content'], 'document.txt', { type: 'text/plain' });

    act(() => {
        const isValid = result.current.validateAndSetError(textFile);
        expect(isValid).toBe(false);
    });

    await waitFor(() => {
        expect(result.current.imageError).toBe('Please select an image file');
    });
});

test('allows null file when not required', () => {
    const { result } = renderHook(() => useImageValidation({
        required: false
    }));

    act(() => {
        const isValid = result.current.validateAndSetError(null);
        expect(isValid).toBe(true);
    });

    expect(result.current.imageError).toBeNull();
});

test('throws error for null file when required', async () => {
    const { result } = renderHook(() => useImageValidation({
        required: true
    }));

    act(() => {
        const isValid = result.current.validateAndSetError(null);
        expect(isValid).toBe(false);
    });

    await waitFor(() => {
        expect(result.current.imageError).toBe('Please select an image');
    });
});

test('handles file at exact size limit', () => {
    const { result } = renderHook(() => useImageValidation({
        maxSize: 5 * 1024 * 1024 // 5MB
    }));
    const exactSizeFile = new File(['content'], 'exact.jpg', { type: 'image/jpeg' });
    Object.defineProperty(exactSizeFile, 'size', { value: 5 * 1024 * 1024 }); // Exactly 5MB

    act(() => {
        const isValid = result.current.validateAndSetError(exactSizeFile);
        expect(isValid).toBe(true);
    });
    expect(result.current.imageError).toBeNull();
});

test('rejects file just over size limit', async () => {
    const { result } = renderHook(() => useImageValidation({
        maxSize: 5 * 1024 * 1024 // 5MB
    }));
    const oversizedFile = new File(['content'], 'over.jpg', { type: 'image/jpeg' });
    Object.defineProperty(oversizedFile, 'size', { value: 5 * 1024 * 1024 + 1 }); // 5MB + 1 byte

    act(() => {
        const isValid = result.current.validateAndSetError(oversizedFile);
        expect(isValid).toBe(false);
    });

    await waitFor(() => {
        expect(result.current.imageError).toBe('File size must be less than 5MB');
    });
});

test('clearError resets error state', async () => {
    const { result } = renderHook(() => useImageValidation());
    const invalidFile = new File(['content'], 'doc.txt', { type: 'text/plain' });

    // Creates an error
    act(() => {
        result.current.validateAndSetError(invalidFile);
    });

    await waitFor(() => {
        expect(result.current.imageError).toBe('Please select an image file');
    });

    // Clears the error
    act(() => {
        result.current.clearError();
    });
    expect(result.current.imageError).toBeNull();
});

test('resetValidation resets error state', async () => {
    const { result } = renderHook(() => useImageValidation());
    const invalidFile = new File(['content'], 'doc.txt', { type: 'text/plain' });

    act(() => {
        result.current.validateAndSetError(invalidFile);
    });

    await waitFor(() => {
        expect(result.current.imageError).toBe('Please select an image file');
    });

    // Resets the validation
    act(() => {
        result.current.resetValidation();
    });
    
    expect(result.current.imageError).toBeNull();
});