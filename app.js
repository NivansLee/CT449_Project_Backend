const express = require('express');
const cors = require('cors');

// Tạo một ứng dụng Express mới
const app = express();

// Sử dụng middleware cors để cho phép các yêu cầu từ các nguồn khác
app.use(cors());

// Sử dụng middleware express.json() để parse dữ liệu JSON từ các request
app.use(express.json());

// Định nghĩa một route GET cho đường dẫn gốc ('/')
app.get('/', (req, res) => {
    // Gửi một phản hồi JSON chứa một message
    res.json({ message: 'Welcome to book management application.' });
});

// Xuất ứng dụng Express để có thể sử dụng ở các file khác
module.exports = app;