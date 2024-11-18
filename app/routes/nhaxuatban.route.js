// Import các file và thư viện
const express = require("express");
const nhaxuatban = require("../controllers/nhaxuatban.controller");

const router = express.Router();

router.route("/")
    .get(nhaxuatban.findAll)
    .post(nhaxuatban.create)
    .delete(nhaxuatban.deleteAll);

router.route("/:manxb")
    .get(nhaxuatban.findOne)
    .put(nhaxuatban.update)
    .delete(nhaxuatban.delete);


module.exports = router;
// Xuất router để có thể sử dụng trong các file khác