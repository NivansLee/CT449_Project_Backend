// Import các file và thư viện
const express = require("express");
const muonsach = require("../controllers/muonsach.controller");

const router = express.Router();

router.route("/")
    .get(muonsach.findAll)  // Lấy tất cả thông tin mượn sách
    .post(muonsach.create)  // Mượn sách mới
    .delete(muonsach.deleteAll);

router.route("/:mamuon")
    .get(muonsach.findOne)  // Lấy thông tin mượn sách theo mã mượn
    .put(muonsach.returnBook)  // Trả sách
    .delete(muonsach.delete);  // Xóa mượn sách



module.exports = router;
