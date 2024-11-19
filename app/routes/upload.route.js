// app/routes/upload.route.js
const express = require("express");
const { uploadImage } = require("../controllers/upload.controller");
const router = express.Router();

// Định nghĩa route POST tại "/"
router.post("/", uploadImage);  // Để `/` vì app.js đã đăng ký với `/api/upload`

module.exports = router;
