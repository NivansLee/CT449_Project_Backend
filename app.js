const express = require("express");// Nhập thư viện Express.js để tạo ứng dụng web backend.
const cors = require("cors"); // Nhập thư viện CORS (Cross-Origin Resource Sharing) để hỗ trợ các yêu cầu từ nguồn khác.
const app = express(); // Tạo một ứng dụng Express.

// Nhập module .route từ tệp .route.js để sử dụng các route liên quan đến
const nhanvienRouter = require("./app/routes/nhanvien.route");
const nhaxuatbanRouter = require("./app/routes/nhaxuatban.route");
const docgiaRouter = require("./app/routes/docgia.route");
const sachRouter = require("./app/routes/sach.route");
const muonsachRouter = require("./app/routes/muonsach.route");
const uploadRouter = require("./app/routes/upload.route.js");
const ApiError = require("./app/api-errors");


app.use(cors());
app.use(express.json());

app.use("/api/nhanvien", nhanvienRouter);
app.use("/api/nhaxuatban", nhaxuatbanRouter);
app.use("/api/docgia", docgiaRouter);
app.use("/api/sach", sachRouter);
app.use("/api/muonsach", muonsachRouter);
app.use("/api/upload", uploadRouter);


app.get("/", (req, res) => {
    res.json({ message: "Welcome to book management application." });
});

// Xử lý lỗi 404 response
app.use((req, res, next) => {
    // Code ở đây sẽ chạy khi không có route được định nghĩa nào
    // khớp với yêu cầu. Gọi next() để chuyển sang middleware xử lý lỗi
    return next(new ApiError(404, "Resource not found"));
});

// Định nghĩa middleware xử lý lỗi ở cuối, sau các lệnh app.use() và các lời gọi đến routes khác.
app.use((err, req, res, next) => {
    // Middleware xử lý lỗi tập trung.
    // Trong các đoạn code xử lý các route, gọi next(error) sẽ chuyển về middleware xử lý lỗi này
    return res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error"
    });
});
// Xuất ứng dụng Express để có thể sử dụng ở các file khác
module.exports = app;