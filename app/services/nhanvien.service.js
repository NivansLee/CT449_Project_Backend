const { ObjectId } = require("mongodb");
const ApiError = require("../api-errors");

class NhanvienService {
    constructor(client) {
        this.Nhanvien = client.db().collection("nhanvien");
    }

    // Hàm tạo mã số nhân viên tự động
    async generateMsnv() {
        try {
            const lastNhanvien = await this.Nhanvien.find().sort({ msnv: -1 }).limit(1).toArray();
            const lastMsnv = lastNhanvien.length > 0 ? lastNhanvien[0].msnv : "NV000";
            const lastNumber = parseInt(lastMsnv.replace("NV", ""));
            const nextNumber = lastNumber + 1;
            return `NV${nextNumber.toString().padStart(3, '0')}`;
        } catch (error) {
            console.error("Lỗi khi tạo mã nhân viên:", error);
            throw new ApiError(500, "Đã xảy ra lỗi khi tạo mã nhân viên");
        }
    }

    // Hàm tạo nhân viên mới và kiểm tra số điện thoại, mật khẩu
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

            // Trả về thông tin nhân viên mới được thêm, bao gồm msnv
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
                // Ném lỗi 404 nếu không tìm thấy nhân viên
                throw new ApiError(404, `Không tìm thấy nhân viên với MSNV ${msnv}`);
            }
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error("Lỗi khi xóa nhân viên:", error);
            // Chỉ ném lỗi 500 trong trường hợp có lỗi không mong muốn (chứ không phải khi không tìm thấy nhân viên)
            if (error.statusCode !== 404) {
                throw new ApiError(500, "Đã xảy ra lỗi khi xóa nhân viên");
            }
            throw error; // Ném lại lỗi nếu là lỗi 404 (không tìm thấy nhân viên)
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

            const result = await this.Nhanvien.updateOne(
                { msnv },
                { $set: updateData }
            );

            const updatedNhanvien = await this.Nhanvien.findOne({ msnv });

            // Trả về dữ liệu nhân viên ngay cả khi không có thay đổi
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
            // Kiểm tra nếu msnv hoặc password không được cung cấp
            if (!msnv || !password) {
                throw new ApiError(400, "Cần cung cấp mã số nhân viên và mật khẩu");
            }

            // Tìm nhân viên trong cơ sở dữ liệu theo msnv và password
            const nhanvien = await this.Nhanvien.findOne({ msnv, password });

            // Nếu không tìm thấy nhân viên hoặc sai mật khẩu, thông báo chung
            if (!nhanvien) {
                throw new ApiError(400, "Mã số nhân viên hoặc mật khẩu không đúng");
            }

            // Trả về thông tin nhân viên (loại bỏ mật khẩu)
            const nhanvienInfo = { ...nhanvien };
            delete nhanvienInfo.password;
            return nhanvienInfo;

        } catch (error) {
            // Nếu lỗi là do ApiError (lỗi do người dùng nhập sai), trả về thông báo chính xác
            if (error instanceof ApiError) {
                throw error;
            }
            // Nếu gặp lỗi khác, báo lỗi chung cho tất cả trường hợp ngoài kiểm tra
            console.error("Lỗi khi đăng nhập:", error);
            throw new ApiError(500, "Đã xảy ra lỗi khi đăng nhập");
        }
    }

}

module.exports = NhanvienService;
