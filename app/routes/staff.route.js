// Import các file và thư viện
const express = require("express");
const staff = require("../controllers/staff.controller");

const router = express.Router();

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