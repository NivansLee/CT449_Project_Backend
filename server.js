const app = require("./app"); // Import ứng dụng Express từ file app.js
const config = require("./app/config"); // Import cấu hình ứng dụng từ file config.js

// Khởi động server
const PORT = config.app.port; // Lấy cổng từ cấu hình
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`); // In ra thông báo server đang chạy trên cổng nào
});