const express = require("express");// Nhập thư viện Express.js để tạo ứng dụng web backend.
const cors = require("cors"); // Nhập thư viện CORS (Cross-Origin Resource Sharing) để hỗ trợ các yêu cầu từ nguồn khác.
const app = express(); // Tạo một ứng dụng Express.

const staffRouter = require("./app/route/staff.route")

app.use(cors());// Sử dụng middleware cors để cho phép các yêu cầu từ các nguồn khác
app.use(express.json()); // Sử dụng middleware express.json() để parse dữ liệu JSON từ các request

app.use("/api/staff", staffRouter);

// Định nghĩa một route GET cho đường dẫn gốc ('/')
app.get("/", (req, res) => {
    // Gửi một phản hồi JSON chứa một message
    res.json({ message: "Welcome to book management application." });
});

// Xuất ứng dụng Express để có thể sử dụng ở các file khác
module.exports = app;