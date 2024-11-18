const DocgiaService = require("../services/docgia.service");
const ApiError = require("../api-errors");
const MongoDB = require("../utils/mongodb.util");

// Hàm tạo 1 độc giả mới
exports.create = async (req, res, next) => {
    if (
        !req.body?.holot ||
        !req.body?.ten ||
        !req.body?.ngaysinh ||
        !req.body?.phai ||
        !req.body?.dienthoai ||
        !req.body?.diachi ||
        !req.body?.password
    ) {
        return next(new ApiError(400, "Tất cả các trường thông tin là bắt buộc."));
    }

    try {
        const docgiaService = new DocgiaService(MongoDB.client);
        const document = await docgiaService.create(req.body);
        return res.status(201).send({
            message: "Tạo đọc giả mới thành công.",
            docgia: document,
        });
    } catch (error) {
        return next(error);
    }
};

// Hàm lấy danh sách tất cả độc giả
exports.findAll = async (req, res, next) => {
    try {
        const docgiaService = new DocgiaService(MongoDB.client);
        const docgiaList = await docgiaService.findAll();

        if (docgiaList.length === 0) {
            return res.status(404).send({
                message: "Không có đọc giả nào trong cơ sở dữ liệu.",
            });
        }

        return res.status(200).send(docgiaList);
    } catch (error) {
        return next(error);
    }
};

// Hàm tìm 1 độc giả theo madocgia
exports.findOne = async (req, res, next) => {
    try {
        const docgiaService = new DocgiaService(MongoDB.client);
        const docgia = await docgiaService.findOne(req.params.madocgia);
        return res.status(200).send({
            message: "Tìm đọc giả thành công.",
            docgia,
        });
    } catch (error) {
        return next(error);
    }
};

// Hàm cập nhật thông tin 1 độc giả theo madocgia
exports.update = async (req, res, next) => {
    try {
        const docgiaService = new DocgiaService(MongoDB.client);
        const updatedDocgia = await docgiaService.update(req.params.madocgia, req.body);
        return res.status(200).send({
            message: "Cập nhật thông tin đọc giả thành công.",
            docgia: updatedDocgia,
        });
    } catch (error) {
        return next(error);
    }
};

// Hàm xoá độc giả theo madocgia
exports.delete = async (req, res, next) => {
    try {
        const docgiaService = new DocgiaService(MongoDB.client);
        const result = await docgiaService.delete(req.params.madocgia);
        return res.status(200).send({
            message: "Xoá đọc giả thành công.",
        });
    } catch (error) {
        return next(error);
    }
};

// Hàm xoá tất cả độc giả
exports.deleteAll = async (req, res, next) => {
    try {
        const docgiaService = new DocgiaService(MongoDB.client);
        const result = await docgiaService.deleteAll();
        return res.status(200).send({
            message: "Xoá tất cả đọc giả thành công.",
        });
    } catch (error) {
        return next(error);
    }
};

// Hàm đăng nhập
exports.login = async (req, res, next) => {
    if (!req.body?.dienthoai || !req.body?.password) {
        return next(new ApiError(400, "Số điện thoại và mật khẩu là bắt buộc."));
    }

    try {
        const docgiaService = new DocgiaService(MongoDB.client);
        const docgia = await docgiaService.login(req.body);

        return res.status(200).send({
            message: "Đăng nhập thành công.",
            docgia: docgia,  // Trả lại thông tin độc giả (loại bỏ mật khẩu)
        });
    } catch (error) {
        return next(error);
    }
};
