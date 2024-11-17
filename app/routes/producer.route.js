// Import các file và thư viện
const express = require("express");
const producer = require("../controllers/producer.controller");

const router = express.Router();

router.route("/")
    .get(producer.findAll)
    .post(producer.create)
    .delete(producer.deleteAll);

router.route("/:manxb")
    .get(producer.findOne)
    .put(producer.update)
    .delete(producer.delete);


module.exports = router;
// Xuất router để có thể sử dụng trong các file khác