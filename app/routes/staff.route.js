// Import các file và thư viện
const express = require("express");
const staff = require("../controllers/staff.controller");

const router = express.Router();
// Tạo một router mới để định nghĩa các route (đường dẫn) và các phương thức HTTP tương ứng

router.route("/")
    .get(staff.findAll)
    .post(staff.create)
    .delete(staff.deleteAll);

router.route("/:msnv")
    .get(staff.findOne)
    .put(staff.update)
    .delete(staff.delete);

router.route("/login")
    .post(staff.login);


module.exports = router;
// Xuất router để có thể sử dụng trong các file khác