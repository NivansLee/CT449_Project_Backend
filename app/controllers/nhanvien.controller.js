const NhanvienService = require("../services/nhanvien.service");
const ApiError = require("../api-errors");
const MongoDB = require("../utils/mongodb.util");

// Hàm tạo một nhân viên mới
exports.create = async (req, res, next) => {
    try {
        const nhanvienService = new NhanvienService(MongoDB.client);
        const nhanvien = await nhanvienService.create(req.body);
        res.status(201).send({
            message: "Tạo nhân viên thành công",
            nhanvien,
        });
    } catch (error) {
        next(error);
    }
};

// Hàm lấy danh sách tất cả nhân viên
exports.findAll = async (req, res, next) => {
    try {
        const nhanvienService = new NhanvienService(MongoDB.client);
        const nhanvienList = await nhanvienService.findAll();
        res.status(200).send(nhanvienList);
    } catch (error) {
        next(error);
    }
};

// Hàm tìm một nhân viên theo mã số nhân viên (msnv)
exports.findOne = async (req, res, next) => {
    try {
        const msnv = req.params.msnv;
        const nhanvienService = new NhanvienService(MongoDB.client);
        const nhanvien = await nhanvienService.findOne(msnv);
        res.status(200).send({
            message: "Tìm thấy nhân viên thành công",
            nhanvien,
        });
    } catch (error) {
        next(error);
    }
};

// Hàm cập nhật thông tin nhân viên
exports.update = async (req, res, next) => {
    try {
        const msnv = req.params.msnv;
        const nhanvienService = new NhanvienService(MongoDB.client);
        const updatedNhanvien = await nhanvienService.update(msnv, req.body);

        // Kiểm tra nếu trả về một đối tượng có message, có thể là không tìm thấy nhân viên
        if (updatedNhanvien.message) {
            return res.status(404).send({ message: updatedNhanvien.message });
        }

        res.status(200).send({
            message: "Cập nhật thông tin nhân viên thành công",
            nhanvien: updatedNhanvien,
        });
    } catch (error) {
        next(error);
    }
};


// Hàm xoá nhân viên theo mã số nhân viên (msnv)
exports.delete = async (req, res, next) => {
    try {
        const msnv = req.params.msnv;
        const nhanvienService = new NhanvienService(MongoDB.client);
        await nhanvienService.delete(msnv);
        res.status(200).send({
            message: `Xóa nhân viên với MSNV ${msnv} thành công`,
        });
    } catch (error) {
        next(error);
    }
};

// Hàm xoá tất cả nhân viên
exports.deleteAll = async (req, res, next) => {
    try {
        const nhanvienService = new NhanvienService(MongoDB.client);
        await nhanvienService.deleteAll();
        res.status(200).send({
            message: "Xóa tất cả nhân viên thành công",
        });
    } catch (error) {
        next(error);
    }
};

// Hàm đăng nhập
exports.login = async (req, res, next) => {
    try {
        const nhanvienService = new NhanvienService(MongoDB.client);
        const staffInfo = await nhanvienService.login(req.body);
        res.status(200).send({
            message: "Đăng nhập thành công",
            staffInfo,
        });
    } catch (error) {
        next(error);
    }
};
