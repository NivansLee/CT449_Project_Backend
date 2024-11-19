const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Cấu hình multer để lưu file vào thư mục 'app/uploads'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Đảm bảo sử dụng đường dẫn tuyệt đối tới thư mục 'app/uploads'
        const uploadDir = path.join(__dirname, "../../app/uploads");

        // Kiểm tra thư mục uploads đã tồn tại chưa, nếu chưa thì tạo mới
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });  // Tạo thư mục nếu không tồn tại
        }

        cb(null, uploadDir); // Đảm bảo lưu file vào thư mục app/uploads
    },
    filename: function (req, file, cb) {
        // Tạo tên file duy nhất
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});

// Middleware upload sử dụng multer
const uploadMiddleware = multer({ storage }).single("image"); // Chỉ chấp nhận 1 file hình ảnh

// Hàm xử lý upload hình ảnh vào thư mục
const uploadImageToLocal = (file) => {
    if (!file) {
        throw new Error("Không có file nào được tải lên");
    }
    // Trả về đường dẫn file đã được lưu vào thư mục app/uploads
    return `app/uploads/${file.filename}`;
};

module.exports = {
    uploadMiddleware,
    uploadImageToLocal,
};
