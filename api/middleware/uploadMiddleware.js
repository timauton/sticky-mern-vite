const multer = require("multer");
const path = require("path");


// Storage config: applies a unique suffix to prevent files being overwritten & depending on the path
const generateFilename = (uploadPath, originalname) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = 'meme'; // add more here if we have different kinds of image upload
    return prefix + '-' + uniqueSuffix + path.extname(originalname);
}


const createStorage = (uploadPath) => {
    return multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
            const filename = generateFilename(uploadPath, file.originalname);
            callback(null, filename);
        }
    });
};

// File filter for images
const imageFilter = (req, file, callback) => {
    // Checks file is an image
    if (!file.mimetype.startsWith('image/')) {
        return callback(new Error('Only image files are allowed'), false);
    } 
    // Checks file is an allowed type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.mimetype)) {
        return callback(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'), false)
    }
    // If all checks are passed
    callback(null, true);  
};

// Different upload configurations
// Additional configs can be listed in this function after posts. For example: profile might look like:
// profiles: multer({
//     storage: createStorage('uploads/images'),
//     fileFilter: imageFilter;
//     limits: {fileSize: 5 * 1024 * 1024} // 5MB})
// });
const uploadConfigs = {
    // For memes
    memes: multer({
        storage: createStorage('uploads/'),
        fileFilter: imageFilter,
        limits: {fileSize: 5 * 1024 * 1024} // 5MB
    })
};

// Error handling
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({error: 'File is too large'});
        }
    }
    if (error.message === 'Only image files are allowed') {
        return res.status(400).json({error: 'Only image files are allowed'});
    }

    if (error.message === 'Only JPEG, PNG, GIF, and WebP images are allowed') {
        return res.status(400).json({error: 'Only JPEG, PNG, GIF, and WebP images are allowed'});
    }
    next(error);
};

module.exports = {
    uploadConfigs,
    handleUploadError,
    imageFilter,
    generateFilename
};