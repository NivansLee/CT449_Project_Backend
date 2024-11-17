const { ObjectId } = require("mongodb");
const ApiError = require("../api-errors");

class StaffService {
    constructor(client) {
        this.Staff = client.db().collection("staff");
    }


    // Hàm tạo mã số nhân viên tự động
    async generateMsnv() {
        try {
            const lastStaff = await this.Staff.find().sort({ msnv: -1 }).limit(1).toArray();

            // Kiểm tra nếu không có nhân viên nào trong cơ sở dữ liệu
            const lastMsnv = lastStaff.length > 0 ? lastStaff[0].msnv : "NV000";
            const lastNumber = parseInt(lastMsnv.replace("NV", ""));
            const nextNumber = lastNumber + 1;
            return `NV${nextNumber.toString().padStart(3, '0')}`;
        } catch (error) {
            console.error("Error generating msnv:", error);
            throw new ApiError(500, "An error occurred while generating msnv");
        }
    }


    // Hàm tạo nhân viên mới và kiểm tra số điện thoại, mật khẩu
    async create(payload) {
        // Kiểm tra nếu số điện thoại đã tồn tại trong cơ sở dữ liệu
        const phoneExists = await this.Staff.findOne({ sodienthoai: payload.sodienthoai });
        if (phoneExists) {
            throw new ApiError(400, "Phone number already exists");
        }

        // Kiểm tra nếu mật khẩu đã tồn tại trong cơ sở dữ liệu
        const passwordExists = await this.Staff.findOne({ password: payload.password });
        if (passwordExists) {
            throw new ApiError(400, "Password already exists");
        }

        try {
            // Tạo mã nhân viên tự động
            const msnv = await this.generateMsnv();

            // Tạo đối tượng nhân viên
            const staff = {
                msnv, // Đảm bảo msnv là trường đầu tiên
                hotennv: payload.hotennv,
                password: payload.password,
                chucvu: payload.chucvu,
                diachi: payload.diachi,
                sodienthoai: payload.sodienthoai,
            };

            // Thêm nhân viên mới vào collection "staff"
            const result = await this.Staff.insertOne(staff);

            // Trả về thông tin nhân viên mới được thêm, bao gồm msnv
            if (result.insertedId) {
                const newStaff = await this.Staff.findOne({ _id: result.insertedId });
                return newStaff; // Trả về thông tin nhân viên đã được tạo
            } else {
                throw new ApiError(500, "Failed to create staff");
            }
        } catch (error) {
            console.error("Error creating staff:", error);
            throw new ApiError(500, "An error occurred while creating the staff");
        }
    }


    // Hàm tìm tất cả nhân viên
    async findAll() {
        const staffList = await this.Staff.find({}).toArray(); // Trả về tất cả nhân viên trong collection
        return staffList;
    }


    // Hàm xoá 1 nhân viên theo msnv
    async delete(msnv) {
        try {
            // Xóa nhân viên theo msnv
            const result = await this.Staff.deleteOne({ msnv });

            // Kiểm tra xem có xóa được nhân viên không
            if (result.deletedCount === 0) {
                // Nếu không xóa được nhân viên, trả về null
                return null;
            }

            // Trả về thông tin nhân viên đã bị xóa
            return result;
        } catch (error) {
            console.error("Error deleting staff:", error);
            throw new ApiError(500, "An error occurred while deleting the staff");
        }
    }


    // Hàm xoá tất cả nhân viên
    async deleteAll() {
        const result = await this.Staff.deleteMany({});
        return result;
    }


    // Hàm tìm một nhân viên theo msnv
    async findOne(msnv) {
        try {
            const staff = await this.Staff.findOne({ msnv }); // Tìm nhân viên theo msnv
            return staff; // Nếu tìm thấy, trả về thông tin nhân viên
        } catch (error) {
            console.error("Error finding staff:", error);
            throw new ApiError(500, "An error occurred while finding the staff");
        }
    }


    // Hàm cập nhật thông tin nhân viên
    async update(msnv, updateData) {
        try {
            // Tìm kiếm nhân viên trước khi kiểm tra số điện thoại hoặc mật khẩu
            const existingStaff = await this.Staff.findOne({ msnv });
            if (!existingStaff) {
                throw new ApiError(404, `Staff with msnv ${msnv} not found`);
            }

            // Kiểm tra trùng số điện thoại (nếu có yêu cầu cập nhật số điện thoại)
            if (updateData.sodienthoai) {
                const existingPhone = await this.Staff.findOne({
                    sodienthoai: updateData.sodienthoai,
                    msnv: { $ne: msnv }, // Loại trừ nhân viên hiện tại
                });
                if (existingPhone) {
                    throw new ApiError(400, "Phone number already exists");
                }
            }

            // Kiểm tra trùng mật khẩu (nếu có yêu cầu cập nhật mật khẩu)
            if (updateData.password) {
                const existingPassword = await this.Staff.findOne({
                    password: updateData.password,
                    msnv: { $ne: msnv }, // Loại trừ nhân viên hiện tại
                });
                if (existingPassword) {
                    throw new ApiError(400, "Password already exists");
                }
            }

            // Thực hiện cập nhật dữ liệu
            const result = await this.Staff.updateOne(
                { msnv },
                { $set: updateData }
            );

            // Nếu không có thay đổi dữ liệu, vẫn trả về nhân viên hiện tại
            if (result.modifiedCount === 0) {
                return existingStaff; // Trả về thông tin nhân viên hiện tại
            }

            // Trả về thông tin nhân viên đã được cập nhật
            const updatedStaff = await this.Staff.findOne({ msnv });
            return updatedStaff;
        } catch (error) {
            console.error("Error updating staff:", error);
            throw error instanceof ApiError
                ? error
                : new ApiError(500, "An error occurred while updating the staff");
        }
    }


    // Hàm đăng nhập
    async login(payload) {
        const { msnv, password } = payload; // Lấy msnv và password từ payload

        try {
            // Kiểm tra xem msnv và password có được cung cấp không
            if (!msnv || !password) {
                throw new ApiError(400, "msnv and password are required");
            }

            // Tìm nhân viên theo msnv và password
            const staff = await this.Staff.findOne({ msnv, password });

            if (!staff) {
                throw new ApiError(400, "Invalid msnv or password");
            }

            // Nếu tìm thấy nhân viên, trả về thông tin nhân viên (trừ mật khẩu)
            const staffInfo = { ...staff };
            delete staffInfo.password; // Loại bỏ mật khẩu sau khi đã chắc chắn staff tồn tại
            return staffInfo;

        } catch (error) {
            console.error("Error during login:", error); // Log chi tiết lỗi
            throw new ApiError(500, error.message || "An error occurred while logging in");
        }
    }

}


module.exports = StaffService;
