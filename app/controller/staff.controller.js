// Tạo một nhân viên mới
exports.create = (req, res) => {
    res.send({ message: "create handler" });
};

// Hàm lấy danh sách tất cả các nhân viên
exports.findAll = (req, res) => {
    res.send({ message: "findAll handler" });
};

// Hàm tìm một nhân viên theo ID
exports.findOne = (req, res) => {
    res.send({ message: "findOne handler" });
};

// Hàm cập nhật thông tin của một nhân viên
exports.update = (req, res) => {
    res.send({ message: "update handler" });
};

// Hàm xóa một nhân viên
exports.delete = (req, res) => {
    res.send({ message: "delete handler" });
};

// Hàm xóa tất cả các nhân viên
exports.deleteAll = (req, res) => {
    res.send({ message: "deleteAll handler" });
};

