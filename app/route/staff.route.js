// Import các file và thư viện
const express = require("express");
const contacts = require("./controllers/contact.controller");

const router = express.Router();
// Tạo một router mới để định nghĩa các route (đường dẫn) và các phương thức HTTP tương ứng

router.route("/")
    .get(staff.findAll) // GET /: Lấy danh sách tất cả các nhân viên
    .post(staff.create) // POST /: Tạo một nhân viên mới
    .delete(staff.deleteAll); // DELETE /: Xóa tất cả các nhân viên

router.route("/:id")
    .get(staff.findOne) // GET /:id: Lấy thông tin chi tiết của một nhân viên theo ID
    .put(staff.update) // PUT /:id: Cập nhật thông tin của một nhân viên theo ID
    .delete(staff.delete); // DELETE /:id: Xóa một nhân viên theo ID

router.route("/signin")
    .post(staff.signin);

module.exports = router;
// Xuất router để có thể sử dụng trong các file khác