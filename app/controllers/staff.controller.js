const StaffService = require("../services/staff.service");
const ApiError = require("../api-errors");
const MongoDB = require("../utils/mongodb.util");

// Hàm tạo một nhân viên mới
exports.create = async (req, res, next) => {
    // Kiểm tra xem các trường dữ liệu có bị thiếu không
    if (!req.body?.hotennv || !req.body?.password || !req.body?.chucvu || !req.body?.diachi || !req.body?.sodienthoai) {
        return next(new ApiError(400, "All fields cannot be empty"));
    }

    try {
        const staffService = new StaffService(MongoDB.client);

        // Gọi phương thức create từ staffService
        const document = await staffService.create(req.body);

        // Trả về thông tin nhân viên đã được tạo
        return res.status(201).send({
            message: "Staff created successfully",
            staff: document
        });
    } catch (error) {
        // Xử lý lỗi nếu có
        return next(new ApiError(error.statusCode || 500, error.message || "An error occurred while creating the staff"));
    }
};


// Hàm lấy danh sách tất cả các nhân viên
exports.findAll = async (req, res, next) => {
    try {
        const staffService = new StaffService(MongoDB.client);
        const staffList = await staffService.findAll();

        // Nếu không có nhân viên nào trong cơ sở dữ liệu
        if (staffList.length === 0) {
            return res.status(404).send({
                message: "No staff found"
            });
        }

        return res.status(200).send(staffList); // Trả về danh sách nhân viên
    } catch (error) {
        console.error("Error fetching staff list:", error);
        return next(new ApiError(500, "An error occurred while retrieving the staff list"));
    }
}


// Hàm tìm một nhân viên theo MSNV
exports.findOne = async (req, res, next) => {
    const msnv = req.params.msnv; // Lấy msnv từ URL parameters

    if (!msnv) {
        return next(new ApiError(400, "MSNV parameter is required"));
    }

    try {
        const staffService = new StaffService(MongoDB.client);
        const staff = await staffService.findOne(msnv); // Tìm nhân viên theo msnv
        return res.status(200).send({
            message: "Staff found successfully",
            staff: staff // Trả về thông tin nhân viên
        });
    } catch (error) {
        return next(error); // Để xử lý lỗi
    }
};


// Hàm cập nhật thông tin nhân viên theo msnv
exports.update = async (req, res, next) => {
    const { msnv } = req.params; // Lấy msnv từ URL params
    const updateData = req.body; // Lấy dữ liệu cập nhật từ body request

    try {
        const staffService = new StaffService(MongoDB.client);

        // Tìm nhân viên theo msnv trước khi cập nhật
        const staff = await staffService.findOne(msnv); // Gọi hàm findOne để tìm nhân viên

        // Nếu không tìm thấy nhân viên, trả về lỗi 404
        if (!staff) {
            return res.status(404).send({
                message: `Staff with msnv ${msnv} not found`
            });
        }

        // Cập nhật thông tin nhân viên theo msnv
        const updatedStaff = await staffService.update(msnv, updateData);

        // Trả về kết quả sau khi cập nhật thành công
        return res.status(200).send({
            message: "Staff updated successfully",
            staff: updatedStaff  // Trả về thông tin nhân viên sau khi cập nhật
        });
    } catch (error) {
        console.error("Error updating staff:", error);
        return next(new ApiError(500, "An error occurred while updating the staff"));
    }
};


// Hàm xóa một nhân viên
exports.delete = async (req, res, next) => {
    const { msnv } = req.params;  // Lấy msnv từ URL params

    try {
        const staffService = new StaffService(MongoDB.client);

        // Tìm nhân viên theo msnv
        const staff = await staffService.findOne(msnv);

        // Nếu không tìm thấy nhân viên, trả về lỗi 404
        if (!staff) {
            return res.status(404).send({
                message: `Staff with msnv ${msnv} not found`
            });
        }

        // Tiến hành xóa nhân viên
        const result = await staffService.delete(msnv);

        // Nếu xóa thành công, trả về thông báo thành công
        return res.status(200).send({
            message: `Staff with msnv ${msnv} has been deleted successfully`,
        });
    } catch (error) {
        console.error("Error deleting staff:", error);
        return next(new ApiError(500, "An error occurred while deleting the staff"));
    }
};


// Hàm xóa tất cả các nhân viên
exports.deleteAll = async (req, res, next) => {
    try {
        const staffService = new StaffService(MongoDB.client);
        const result = await staffService.deleteAll();

        if (result.deletedCount === 0) {
            return res.status(404).send({
                message: "No staff found to delete"
            });
        }

        return res.status(200).send({
            message: `${result.deletedCount} staff(s) were deleted successfully`
        });
    } catch (error) {
        console.error("Error deleting all staff:", error);
        return next(new ApiError(500, "An error occurred while deleting all staff"));
    }

}


// Hàm đăng nhập
exports.login = async (req, res, next) => {
    const payload = req.body; // Lấy tất cả thông tin từ body của request

    // Kiểm tra nếu msnv hoặc password không được cung cấp
    if (!payload.msnv || !payload.password) {
        return next(new ApiError(400, "msnv and password are required"));
    }

    try {
        const staffService = new StaffService(MongoDB.client);

        // Gọi phương thức login từ staffService, truyền vào payload
        const staffInfo = await staffService.login(payload);

        // Trả về thông tin nhân viên nếu đăng nhập thành công
        return res.status(200).send({
            message: "Login successful",
            staff: staffInfo
        });
    } catch (error) {
        console.error("Error logging in:", error); // Log lỗi chi tiết
        return next(new ApiError(error.statusCode || 500, error.message || "An error occurred while logging in"));
    }
};

