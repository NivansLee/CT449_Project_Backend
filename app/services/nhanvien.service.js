const { ObjectId } = require("mongodb");
const ApiError = require("../api-errors");

class NhanvienService {
    constructor(client) {
        this.Nhanvien = client.db().collection("nhanvien");
    }

    // Hàm tạo mã số nhân viên tự động
    async generateMsnv() {
        try {
            // Lấy tất cả các mã nhân viên hiện tại
            const allNhanvien = await this.Nhanvien.find({}, { projection: { msnv: 1 } }).toArray();

            // Chuyển tất cả mã nhân viên thành mảng số (bỏ phần NV)
            const allNumbers = allNhanvien
                .map(nv => parseInt(nv.msnv.replace("NV", ""), 10))
                .sort((a, b) => a - b);

            // Tìm mã bị thiếu trong chuỗi số
            let missingNumber = null;
            for (let i = 1; i <= allNumbers.length; i++) {
                if (!allNumbers.includes(i)) {
                    missingNumber = i; // Số nhỏ nhất bị thiếu
                    break;
                }
            }

            // Nếu có số bị thiếu, dùng số đó để tạo mã
            if (missingNumber !== null) {
                return `NV${missingNumber.toString().padStart(3, "0")}`;
            }

            // Nếu không có số bị thiếu, tạo mã mới tiếp theo
            const nextNumber = allNumbers.length > 0 ? Math.max(...allNumbers) + 1 : 1;
            return `NV${nextNumber.toString().padStart(3, "0")}`;
        } catch (error) {
            console.error("Lỗi khi tạo mã nhân viên:", error);
            throw new ApiError(500, "Đã xảy ra lỗi khi tạo mã nhân viên");
        }
    }

    // Hàm tạo nhân viên mới
    async create(payload) {
        // Kiểm tra nếu số điện thoại đã tồn tại trong cơ sở dữ liệu
        const phoneExists = await this.Nhanvien.findOne({ sodienthoai: payload.sodienthoai });
        if (phoneExists) {
            throw new ApiError(400, "Số điện thoại đã tồn tại");
        }

        // Kiểm tra nếu mật khẩu đã tồn tại trong cơ sở dữ liệu
        const passwordExists = await this.Nhanvien.findOne({ password: payload.password });
        if (passwordExists) {
            throw new ApiError(400, "Mật khẩu đã tồn tại");
        }

        try {
            // Tạo mã nhân viên tự động
            const msnv = await this.generateMsnv();

            // Tạo đối tượng nhân viên
            const nhanvien = {
                msnv,
                hotennv: payload.hotennv,
                password: payload.password,
                chucvu: payload.chucvu,
                diachi: payload.diachi,
                sodienthoai: payload.sodienthoai,
            };

            // Thêm nhân viên mới vào collection "nhanvien"
            const result = await this.Nhanvien.insertOne(nhanvien);

            // Trả về thông tin nhân viên mới được thêm
            if (result.insertedId) {
                const newNhanvien = await this.Nhanvien.findOne({ _id: result.insertedId });
                return newNhanvien;
            } else {
                throw new ApiError(500, "Thêm nhân viên không thành công");
            }
        } catch (error) {
            console.error("Lỗi khi tạo nhân viên:", error);
            throw new ApiError(500, "Đã xảy ra lỗi khi tạo nhân viên");
        }
    }

    // Hàm lấy tất cả nhân viên
    async findAll() {
        const nhanvienList = await this.Nhanvien.find({}).toArray();
        if (nhanvienList.length === 0) {
            throw new ApiError(404, "Không tìm thấy nhân viên nào");
        }
        return nhanvienList;
    }

    // Hàm xoá nhân viên theo mã số nhân viên (msnv)
    async delete(msnv) {
        try {
            const result = await this.Nhanvien.deleteOne({ msnv });

            // Kiểm tra nếu không tìm thấy nhân viên để xoá
            if (result.deletedCount === 0) {
                throw new ApiError(404, `Không tìm thấy nhân viên với MSNV ${msnv}`);
            }
        } catch (error) {
            console.error("Lỗi khi xóa nhân viên:", error);
            if (error.statusCode !== 404) {
                throw new ApiError(500, "Đã xảy ra lỗi khi xóa nhân viên");
            }
            throw error;
        }
    }

    // Hàm xoá tất cả nhân viên
    async deleteAll() {
        const result = await this.Nhanvien.deleteMany({});
        if (result.deletedCount === 0) {
            throw new ApiError(404, "Không có nhân viên nào để xoá");
        }
        return result;
    }

    // Hàm tìm một nhân viên theo msnv
    async findOne(msnv) {
        try {
            const nhanvien = await this.Nhanvien.findOne({ msnv });
            if (!nhanvien) {
                throw new ApiError(404, `Không tìm thấy nhân viên với MSNV ${msnv}`);
            }
            return nhanvien;
        } catch (error) {
            console.error("Lỗi khi tìm nhân viên:", error);
            throw new ApiError(500, "Đã xảy ra lỗi khi tìm nhân viên");
        }
    }

    // Hàm cập nhật thông tin nhân viên
    async update(msnv, updateData) {
        try {
            const existingNhanvien = await this.Nhanvien.findOne({ msnv });
            if (!existingNhanvien) {
                return { message: `Không tìm thấy nhân viên với mã số ${msnv}` };
            }

            if (updateData.sodienthoai) {
                const existingPhone = await this.Nhanvien.findOne({
                    sodienthoai: updateData.sodienthoai,
                    msnv: { $ne: msnv },
                });
                if (existingPhone) {
                    throw new ApiError(400, "Số điện thoại đã tồn tại");
                }
            }

            if (updateData.password) {
                const existingPassword = await this.Nhanvien.findOne({
                    password: updateData.password,
                    msnv: { $ne: msnv },
                });
                if (existingPassword) {
                    throw new ApiError(400, "Mật khẩu đã tồn tại");
                }
            }

            const result = await this.Nhanvien.updateOne({ msnv }, { $set: updateData });

            const updatedNhanvien = await this.Nhanvien.findOne({ msnv });
            return updatedNhanvien;

        } catch (error) {
            console.error("Lỗi khi cập nhật nhân viên:", error);
            throw new ApiError(500, "Đã xảy ra lỗi khi cập nhật nhân viên");
        }
    }

    // Hàm đăng nhập
    async login(payload) {
        const { msnv, password } = payload;

        try {
            if (!msnv || !password) {
                throw new ApiError(400, "Cần cung cấp mã số nhân viên và mật khẩu");
            }

            const nhanvien = await this.Nhanvien.findOne({ msnv, password });
            if (!nhanvien) {
                throw new ApiError(400, "Mã số nhân viên hoặc mật khẩu không đúng");
            }

            const nhanvienInfo = { ...nhanvien };
            delete nhanvienInfo.password;
            return nhanvienInfo;

        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error("Lỗi khi đăng nhập:", error);
            throw new ApiError(500, "Đã xảy ra lỗi khi đăng nhập");
        }
    }
}

module.exports = NhanvienService;
