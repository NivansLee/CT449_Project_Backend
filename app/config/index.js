const config = {
    // Tạo một đối tượng `config` để lưu trữ các cấu hình của ứng dụng
    app: {
        // Tạo một thuộc tính `port` bên trong đối tượng `app` để lưu trữ thông tin về cổng mà server sẽ lắng nghe
        port: process.env.PORT || 8000, // Nếu biến môi trường `PORT` được đặt, sẽ sử dụng giá trị đó, ngược lại sẽ sử dụng 3000
    },

    db: {
        uri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/QuanLyMuonSach",
    }
};

// Xuất đối tượng `config` để có thể sử dụng ở các file khác
module.exports = config;