const MuonSachService = require("../services/muonsach.service");
const ApiError = require("../api-errors");
const MongoDB = require("../utils/mongodb.util");

// Hàm tạo mượn sách mới
exports.create = async (req, res, next) => {
    if (!req.body?.masach || !req.body?.madocgia) {
        return next(new ApiError(400, "Các trường mã sách và mã độc giả là bắt buộc"));
    }

    try {
        const muonsachService = new MuonSachService(MongoDB.client);
        const muonsach = await muonsachService.create(req.body);
        return res.status(201).send({
            message: "Mượn sách thành công",
            muonsach,
        });
    } catch (error) {
        return next(error);
    }
};

// Hàm lấy danh sách mượn sách
exports.findAll = async (req, res, next) => {
    try {
        const muonsachService = new MuonSachService(MongoDB.client);
        const list = await muonsachService.findAll();
        if (list.length === 0) {
            return res.status(404).send({ message: "Không có mượn sách nào" });
        }
        return res.status(200).send(list);
    } catch (error) {
        return next(error);
    }
};

// Hàm tìm thông tin mượn sách theo mã mượn sách
exports.findOne = async (req, res, next) => {
    const mamuon = req.params.mamuon;
    if (!mamuon) {
        return next(new ApiError(400, "Mã mượn sách là bắt buộc"));
    }

    try {
        const muonsachService = new MuonSachService(MongoDB.client);
        const muonsach = await muonsachService.findById(mamuon);
        return res.status(200).send({
            message: "Tìm thấy thông tin mượn sách thành công",
            muonsach,
        });
    } catch (error) {
        return next(error);
    }
};

// Hàm cập nhật thông tin mượn sách
exports.update = async (req, res, next) => {
    const mamuon = req.params.mamuon;
    if (!mamuon) {
        return next(new ApiError(400, "Mã mượn sách là bắt buộc"));
    }

    try {
        const muonsachService = new MuonSachService(MongoDB.client);
        const updated = await muonsachService.update(mamuon, req.body);
        return res.status(200).send({
            message: "Cập nhật thông tin mượn sách thành công",
            muonsach: updated,
        });
    } catch (error) {
        return next(error);
    }
};

// Hàm xóa thông tin mượn sách
exports.delete = async (req, res, next) => {
    const mamuon = req.params.mamuon;
    if (!mamuon) {
        return next(new ApiError(400, "Mã mượn sách là bắt buộc"));
    }

    try {
        const muonsachService = new MuonSachService(MongoDB.client);
        await muonsachService.delete(mamuon);
        return res.status(200).send({
            message: `Xóa thông tin mượn sách với mã mượn ${mamuon} thành công`,
        });
    } catch (error) {
        return next(error);
    }
};

// Hàm xóa tất cả thông tin mượn sách
exports.deleteAll = async (req, res, next) => {
    try {
        const muonsachService = new MuonSachService(MongoDB.client);
        await muonsachService.deleteAll();
        return res.status(200).send({
            message: "Xóa tất cả thông tin mượn sách thành công",
        });
    } catch (error) {
        return next(error);
    }
};

// Hàm trả sách
exports.returnBook = async (req, res, next) => {
    const mamuon = req.params.mamuon;
    if (!mamuon) {
        return next(new ApiError(400, "Mã mượn sách là bắt buộc"));
    }

    try {
        const muonsachService = new MuonSachService(MongoDB.client);
        const result = await muonsachService.returnBook(mamuon);
        return res.status(200).send({
            message: "Trả sách thành công",
            muonsach: result,
        });
    } catch (error) {
        return next(error);
    }
};
