import { useState } from 'react';

export const useImageValidation = (options = {}) => {
    const [imageError, setImageError] = useState(null)

    const defaultOptions = {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        required: false
    };

    // This allows the defaultOptions to be overriden if other options are passed.
    // Eg. if useImageValidation({maxSize: 2 * 1024 * 1024}) is passed, the config would be:
    // const config = {
    // maxSize: 2 * 1024 * 1024,     // 2MB - overriden by what was passed to useImageValidation
    // allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],   // Default
    // required: false};            // Default

    const config = {...defaultOptions, ...options};

    const validateImage = (file) => {
        // if no file & it's not required, that's fine!
        if (!file && !config.required) return null;

        // if no file but is required
        if (!file && config.required) {
            return 'Please select an image';
        }

        // checks if it's an image type
        if (!file.type.startsWith('image/')) {
            return 'Please select an image file';
        }
            
        if (file.size > config.maxSize) {
        const sizeMB = Math.round(config.maxSize / (1024 * 1024));
        return `File size must be less than ${sizeMB}MB`;
    }

        // filetype check
        if (!config.allowedTypes.includes(file.type)) {
            const typesList = config.allowedTypes
                .map(type => type.split('/')[1].toUpperCase())
                .join(', ');
            return `Only ${typesList} images are allowed`;
        }
        return null; // No error
    };

    // Returns true if file is valid & false if invalid
    const validateAndSetError = (file) => {
        const error = validateImage(file);
        setImageError(error);
        return error === null; 
    };

    const clearError = () => setImageError(null);

    const resetValidation = () => {
        setImageError(null);
    };
    return {
        imageError,
        validateAndSetError,
        clearError,
        resetValidation,
        validateImage,
        isValid: imageError === null
    };
};