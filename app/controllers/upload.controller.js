const { uploadMiddleware, uploadImageToLocal } = require("../services/upload.service");
const ApiError = require("../api-errors");

// Controller xử lý upload hình ảnh
const uploadImage = async (req, res, next) => {
    try {
        // Sử dụng middleware uploadMiddleware từ service
        uploadMiddleware(req, res, async (err) => {
            if (err) {
                return next(new ApiError(400, err.message)); // Lỗi upload
            }

            const file = req.file;  // Multer sẽ lưu file vào req.file
            if (!file) {
                throw new ApiError(400, "Không có file nào được tải lên"); // Không có file được tải lên
            }

            const imageUrl = await uploadImageToLocal(file);  // Lưu hình ảnh vào thư mục và lấy đường dẫn
            res.status(200).json({ imageUrl });  // Trả lại đường dẫn file
        });
    } catch (error) {
        next(error); // Đưa lỗi tiếp theo vào handler
    }
};

module.exports = {
    uploadImage,
};
