const { ObjectId } = require("mongodb");
const ApiError = require("../api-errors");

class DocgiaService {
    constructor(client) {
        this.Docgia = client.db().collection("docgia"); // Collection độc giả
    }

    // Hàm tạo mã độc giả tự động
    async generateMadocgia() {
        try {
            const lastDocgia = await this.Docgia.find().sort({ madocgia: -1 }).limit(1).toArray();

            const lastMadocgia = lastDocgia.length > 0 ? lastDocgia[0].madocgia : "DG000";
            const lastNumber = parseInt(lastMadocgia.replace("DG", ""));
            const nextNumber = lastNumber + 1;
            return `DG${nextNumber.toString().padStart(3, "0")}`;
        } catch (error) {
            console.error("Lỗi tạo mã đọc giả:", error);
            throw new ApiError(500, "Có lỗi xảy ra khi tạo mã đọc giả");
        }
    }

    // Hàm tạo độc giả mới và kiểm tra số điện thoại, mật khẩu
    async create(payload) {
        const phoneExists = await this.Docgia.findOne({ dienthoai: payload.dienthoai });
        if (phoneExists) {
            throw new ApiError(400, "Số điện thoại đã tồn tại");
        }

        const passwordExists = await this.Docgia.findOne({ password: payload.password });
        if (passwordExists) {
            throw new ApiError(400, "Mật khẩu đã tồn tại");
        }

        try {
            const madocgia = await this.generateMadocgia();
            const docgia = {
                madocgia,
                holot: payload.holot,
                ten: payload.ten,
                ngaysinh: payload.ngaysinh,
                phai: payload.phai,
                diachi: payload.diachi,
                dienthoai: payload.dienthoai,
                password: payload.password,
            };

            const result = await this.Docgia.insertOne(docgia);
            if (result.insertedId) {
                const newDocgia = await this.Docgia.findOne({ _id: result.insertedId });
                return newDocgia;
            } else {
                throw new ApiError(500, "Không thể tạo đọc giả mới");
            }
        } catch (error) {
            console.error("Lỗi khi tạo đọc giả:", error);
            throw new ApiError(500, "Có lỗi xảy ra khi tạo đọc giả mới");
        }
    }

    // Hàm tìm tất cả độc giả
    async findAll() {
        const docgiaList = await this.Docgia.find({}).toArray();
        if (docgiaList.length === 0) {
            throw new ApiError(404, "Không tìm thấy đọc giả nào");
        }
        return docgiaList;
    }

    // Hàm xóa một độc giả theo mã độc giả
    async delete(madocgia) {
        try {
            const result = await this.Docgia.deleteOne({ madocgia });

            if (result.deletedCount === 0) {
                throw new ApiError(404, `Không tìm thấy đọc giả với mã ${madocgia}`);
            }
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error("Lỗi khi xóa đọc giả:", error);
            // Chỉ ném lỗi 500 trong trường hợp có lỗi không mong muốn (chứ không phải khi không tìm thấy đọc giả)
            if (error.statusCode !== 404) {
                throw new ApiError(500, "Đã xảy ra lỗi khi xóa đọc giả");
            }
            throw error; // Ném lại lỗi nếu là lỗi 404 (không tìm thấy đọc giả)
        }
    }

    // Hàm xoá tất cả độc giả
    async deleteAll() {
        const result = await this.Docgia.deleteMany({});
        if (result.deletedCount === 0) {
            throw new ApiError(404, "Không có đọc giả nào để xoá");
        }
        return result;
    }

    // Hàm tìm một độc giả theo mã độc giả
    async findOne(madocgia) {
        try {
            const docgia = await this.Docgia.findOne({ madocgia });
            if (!docgia) {
                throw new ApiError(404, `Không tìm thấy đọc giả với mã ${madocgia}`);
            }
            return docgia;
        } catch (error) {
            console.error("Lỗi khi tìm đọc giả:", error);
            throw new ApiError(500, error.message || "Có lỗi xảy ra khi tìm đọc giả");
        }
    }

    // Hàm cập nhật thông tin độc giả
    async update(madocgia, updateData) {
        try {
            const existingDocgia = await this.Docgia.findOne({ madocgia });
            if (!existingDocgia) {
                throw new ApiError(404, `Không tìm thấy đọc giả với mã ${madocgia}`);
            }

            if (updateData.dienthoai) {
                const existingPhone = await this.Docgia.findOne({
                    dienthoai: updateData.dienthoai,
                    madocgia: { $ne: madocgia },
                });
                if (existingPhone) {
                    throw new ApiError(400, "Số điện thoại đã tồn tại");
                }
            }

            if (updateData.password) {
                const existingPassword = await this.Docgia.findOne({
                    password: updateData.password,
                    madocgia: { $ne: madocgia },
                });
                if (existingPassword) {
                    throw new ApiError(400, "Mật khẩu đã tồn tại");
                }
            }

            const result = await this.Docgia.updateOne({ madocgia }, { $set: updateData });
            if (result.modifiedCount === 0) {
                return existingDocgia;
            }

            const updatedDocgia = await this.Docgia.findOne({ madocgia });
            return updatedDocgia;
        } catch (error) {
            console.error("Lỗi khi cập nhật đọc giả:", error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(500, "Có lỗi xảy ra khi cập nhật thông tin đọc giả");

        }
    }

    // Hàm đăng nhập
    async login(payload) {
        const { dienthoai, password } = payload;

        try {
            // Kiểm tra nếu thiếu thông tin
            if (!dienthoai || !password) {
                throw new ApiError(400, "Số điện thoại và mật khẩu là bắt buộc");
            }

            // Tìm kiếm độc giả theo số điện thoại và mật khẩu
            const docgia = await this.Docgia.findOne({ dienthoai, password });

            if (!docgia) {
                throw new ApiError(400, "Số điện thoại hoặc mật khẩu không chính xác");
            }

            // Xóa mật khẩu trước khi trả về thông tin độc giả
            const docgiaInfo = { ...docgia };
            delete docgiaInfo.password;

            return docgiaInfo;

        } catch (error) {
            console.error("Lỗi khi đăng nhập:", error);
            throw new ApiError(500, error.message || "Có lỗi xảy ra khi đăng nhập");
        }
    }

}

module.exports = DocgiaService;
