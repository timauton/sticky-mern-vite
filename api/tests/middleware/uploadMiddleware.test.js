// tests/middleware/uploadMiddleware.test.js
const { imageFilter, generateFilename, handleUploadError } = require("../../middleware/uploadMiddleware")

describe('Upload Middleware', () => {
    describe('imageFilter', () => {
        it('accepts valid JPEG images', () => {
            const mockFile = {
                mimetype: 'image/jpeg',
                originalname: 'test.jpeg'
            };
            
            const mockCallback = jest.fn();
            
            // Checks middleware to see if it will accept file
            imageFilter(null, mockFile, mockCallback);
            
            // As it's valid, should return null errors & true (accepted) as a result
            expect(mockCallback).toHaveBeenCalledWith(null, true);
        });

        it('rejects invalid invalid image types', () => {
            const mockFile = {
                mimetype: 'image/bmp',
                originalname: 'test.bmp'
            };

            const mockCallback = jest.fn();
            
            imageFilter(null, mockFile, mockCallback);

            expect(mockCallback).toHaveBeenCalledWith(
                new Error('Only JPEG, PNG, GIF, and WebP images are allowed'),
                false
            );
        });

        it('rejects non-image types', () => {
            const mockFile = {
                mimetype: 'text/plain',
                originalname: 'document.txt'
            }

            const mockCallback = jest.fn()

            imageFilter(null, mockFile, mockCallback);

            expect(mockCallback).toHaveBeenCalledWith(
                new Error('Only image files are allowed'),
                false
            )
        });

        it('accepts all remaining allowed image types', () => {
            const allowedTypes = ['image/jpg', 'image/png', 'image/gif', 'image/webp']
            const mockCallback = jest.fn();

            // Loop through and test all the remaining allowed file-types
            allowedTypes.forEach(type => {
                mockCallback.mockClear();
                const mockFile = { mimetype: type, originalname: `test.${type.split('/')[1]}` };

                imageFilter(null, mockFile, mockCallback)

                expect(mockCallback).toHaveBeenCalledWith(null, true)
            });
        });
    });

    describe('handleUploadError', () => {
        let mockReq, mockRes, mockNext;

        beforeEach(() => {
            mockReq = {};
            mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            mockNext = jest.fn();
        });

        it('handles file size limit error', () => {
            const error = new Error('File too large');
            error.code = 'LIMIT_FILE_SIZE';
            error.name = 'MulterError';

        Object.setPrototypeOf(error, require('multer').MulterError.prototype);

        handleUploadError(error, mockReq, mockRes, mockNext);

        // Should get an error status of 400 if trying to upload > size limit
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: 'File is too large'});
        expect(mockNext).not.toHaveBeenCalledWith();
        });

        it('handles invalid file type error', () => {
            const error = new Error('Only image files are allowed');

            handleUploadError(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({error: 'Only image files are allowed'});
        });

        it('handles image-type errors', () => {
            const error = new Error('Only JPEG, PNG, GIF, and WebP images are allowed');

            handleUploadError(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({error: 'Only JPEG, PNG, GIF, and WebP images are allowed'});
        });

        it('passes through unknown errors', () => {
            const error = new Error('Unknown error');

            handleUploadError(error, mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockRes.status).not.toHaveBeenCalled();
        });
    })
    describe('generateFilename', () => {
    // Mock Date.now and Math.random to help with the testing
        beforeEach(() => {
        jest.spyOn(Date, 'now').mockReturnValue(1234567890);
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
        });

        afterEach(() => {
        jest.restoreAllMocks();
        });

        it('generates meme filename for uploads path', () => {
            const filename = generateFilename('uploads', 'photo.jpg');
            
            expect(filename).toBe('meme-1234567890-500000000.jpg');
        });

        it('preserves file extension', () => {
            const jpgFilename = generateFilename('uploads', 'test.jpg');
            const pngFilename = generateFilename('uploads', 'test.png');
            const webpFilename = generateFilename('uploads', 'test.webp');
            
            expect(jpgFilename).toMatch(/\.jpg$/);
            expect(pngFilename).toMatch(/\.png$/);
            expect(webpFilename).toMatch(/\.webp$/);
        });

        it('generates unique filenames', () => {
        // Reset mocks to get different values
        jest.restoreAllMocks();
        
        const filename1 = generateFilename('uploads', 'test.jpg');
        const filename2 = generateFilename('uploads', 'test.jpg');
        
        expect(filename1).not.toBe(filename2);
    });
  });
});