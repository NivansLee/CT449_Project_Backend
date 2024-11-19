const NhaxuatbanService = require("../services/nhaxuatban.service");
const ApiError = require("../api-errors");
const MongoDB = require("../utils/mongodb.util");

// Hàm tạo nhà xuất bản mới
exports.create = async (req, res, next) => {
    if (!req.body?.tennxb || !req.body?.diachi) {
        return next(new ApiError(400, "Các trường không được để trống"));
    }

    try {
        const nhaxuatbanService = new NhaxuatbanService(MongoDB.client);
        const nhaxuatban = await nhaxuatbanService.create(req.body);
        return res.status(201).send({
            message: "Nhà xuất bản được tạo thành công",
            nhaxuatban,
        });
    } catch (error) {
        return next(error);
    }
};

// Hàm lấy danh sách nhà xuất bản
exports.findAll = async (req, res, next) => {
    try {
        const nhaxuatbanService = new NhaxuatbanService(MongoDB.client);
        const list = await nhaxuatbanService.findAll();
        if (list.length === 0) {
            return res.status(404).send({ message: "Không có nhà xuất bản nào" });
        }
        return res.status(200).send(list);
    } catch (error) {
        return next(error);
    }
};

// Hàm tìm một nhà xuất bản theo mã
exports.findOne = async (req, res, next) => {
    const manxb = req.params.manxb;
    if (!manxb) {
        return next(new ApiError(400, "Mã nhà xuất bản là bắt buộc"));
    }

    try {
        const nhaxuatbanService = new NhaxuatbanService(MongoDB.client);
        const nhaxuatban = await nhaxuatbanService.findOne(manxb);
        return res.status(200).send({
            message: "Tìm thấy nhà xuất bản thành công",
            nhaxuatban,
        });
    } catch (error) {
        return next(error);
    }
};

// Hàm cập nhật nhà xuất bản
exports.update = async (req, res, next) => {
    const manxb = req.params.manxb;
    if (!manxb) {
        return next(new ApiError(400, "Mã nhà xuất bản là bắt buộc"));
    }

    try {
        const nhaxuatbanService = new NhaxuatbanService(MongoDB.client);
        const updated = await nhaxuatbanService.update(manxb, req.body);
        return res.status(200).send({
            message: "Cập nhật nhà xuất bản thành công",
            nhaxuatban: updated,
        });
    } catch (error) {
        return next(error);
    }
};

// Hàm xóa nhà xuất bản
exports.delete = async (req, res, next) => {
    const manxb = req.params.manxb;
    if (!manxb) {
        return next(new ApiError(400, "Mã nhà xuất bản là bắt buộc"));
    }

    try {
        const nhaxuatbanService = new NhaxuatbanService(MongoDB.client);
        await nhaxuatbanService.delete(manxb);
        return res.status(200).send({
            message: `Xóa nhà xuất bản với mã ${manxb} thành công`,
        });
    } catch (error) {
        return next(error);
    }
};

// Hàm xóa tất cả nhà xuất bản
exports.deleteAll = async (req, res, next) => {
    try {
        const nhaxuatbanService = new NhaxuatbanService(MongoDB.client);
        await nhaxuatbanService.deleteAll();
        res.status(200).send({
            message: "Xóa tất cả nhà xuất bản thành công",
        });
    } catch (error) {
        next(error);
    }
};
