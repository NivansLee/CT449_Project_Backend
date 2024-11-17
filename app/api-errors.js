class ApiError extends Error {
    constructor(statusCode, message) {
        super(); // Gọi constructor của lớp cha (Error) để khởi tạo đối tượng lỗi
        this.statusCode = statusCode; // Gán mã trạng thái lỗi
        this.message = message; // Gán thông báo lỗi
    }
}

module.exports = ApiError;