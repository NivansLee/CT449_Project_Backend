// Import các file và thư viện
const express = require("express");
const docgia = require("../controllers/docgia.controller");

const router = express.Router();

router.route("/")
    .get(docgia.findAll)
    .post(docgia.create)
    .delete(docgia.deleteAll);

router.route("/:madocgia")
    .get(docgia.findOne)
    .put(docgia.update)
    .delete(docgia.delete);

module.exports = router;
// Xuất router để có thể sử dụng trong các file khác