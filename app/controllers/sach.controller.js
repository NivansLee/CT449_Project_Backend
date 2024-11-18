const SachService = require("../services/sach.service");
const ApiError = require("../api-errors");
const MongoDB = require("../utils/mongodb.util");

// Hàm tạo sách mới
exports.create = async (req, res, next) => {
    // Kiểm tra xem các trường cần thiết có tồn tại trong payload hay không
    if (!req.body?.tensach || !req.body?.dongia || !req.body?.soquyen || !req.body?.namxuatban || !req.body?.manxb || !req.body?.tacgia) {
        return next(new ApiError(400, "Các trường không được để trống"));
    }

    try {
        const sachService = new SachService(MongoDB.client);
        const sach = await sachService.create(req.body);
        return res.status(201).send({
            message: "Sách được tạo thành công",
            sach,
        });
    } catch (error) {
        return next(error);
    }
};

// Hàm lấy danh sách tất cả sách
exports.findAll = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        const list = await sachService.findAll();
        if (list.length === 0) {
            return res.status(404).send({ message: "Không có sách nào" });
        }
        return res.status(200).send(list);
    } catch (error) {
        return next(error);
    }
};

// Hàm tìm một sách theo mã
exports.findOne = async (req, res, next) => {
    const masach = req.params.masach;
    if (!masach) {
        return next(new ApiError(400, "Mã sách là bắt buộc"));
    }

    try {
        const sachService = new SachService(MongoDB.client);
        const sach = await sachService.findOne(masach);
        return res.status(200).send({
            message: "Tìm thấy sách thành công",
            sach,
        });
    } catch (error) {
        return next(error);
    }
};

// Hàm cập nhật sách
exports.update = async (req, res, next) => {
    const masach = req.params.masach;  // Mã sách cần cập nhật
    const payload = req.body;          // Dữ liệu mới cập nhật từ client

    // Nếu mã sách không tồn tại trong yêu cầu
    if (!masach) {
        return next(new ApiError(400, "Mã sách là bắt buộc"));
    }

    try {
        const sachService = new SachService(MongoDB.client);  // Khởi tạo service
        const updatedBook = await sachService.update(masach, payload);  // Gọi hàm update

        // Trả về kết quả cập nhật thành công và thông báo
        return res.status(200).send({
            message: "Cập nhật sách thành công",  // Thông báo thành công
            sach: updatedBook,                     // Dữ liệu sách sau khi cập nhật (hoặc không thay đổi)
        });
    } catch (error) {
        // Xử lý lỗi nếu có
        return next(error);
    }
};


// Hàm xóa sách (xóa vĩnh viễn)
exports.delete = async (req, res, next) => {
    const masach = req.params.masach;
    if (!masach) {
        return next(new ApiError(400, "Mã sách là bắt buộc"));
    }

    try {
        const sachService = new SachService(MongoDB.client);
        const deletedBook = await sachService.delete(masach); // Gọi hàm delete từ service
        return res.status(200).send({
            message: `Xóa sách với mã ${masach} thành công`,
        });
    } catch (error) {
        return next(error);
    }
};


// Hàm xóa tất cả sách (xóa vĩnh viễn)
exports.deleteAll = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        await sachService.deleteAll();
        res.status(200).send({
            message: "Xóa tất cả sách thành công",
        });
    } catch (error) {
        next(error);
    }
};
