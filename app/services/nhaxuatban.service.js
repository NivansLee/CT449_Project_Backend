const { ObjectId } = require("mongodb");
const ApiError = require("../api-errors");

class NhaxuatbanService {
    constructor(client) {
        this.Nhaxuatban = client.db().collection("nhaxuatban");
    }

    // Hàm tạo mã nhà xuất bản tự động, kiểm tra mã bị trống (do xóa)
    async generateManxb() {
        try {
            // Lấy danh sách các mã nhà xuất bản, chỉ lấy trường manxb và sắp xếp tăng dần
            const nhaxuatbanList = await this.Nhaxuatban.find({}, { projection: { manxb: 1 } })
                .sort({ manxb: 1 })
                .toArray();

            // Duyệt danh sách mã để tìm mã trống
            let expectedNumber = 1; // Bắt đầu kiểm tra từ NXB001
            for (const nhaxuatban of nhaxuatbanList) {
                const currentNumber = parseInt(nhaxuatban.manxb.replace("NXB", ""));
                if (currentNumber > expectedNumber) {
                    return `NXB${expectedNumber.toString().padStart(3, "0")}`;
                }
                expectedNumber = currentNumber + 1;
            }

            // Nếu không tìm thấy mã trống, tạo mã mới kế tiếp
            return `NXB${expectedNumber.toString().padStart(3, "0")}`;
        } catch (error) {
            console.error("Lỗi khi tạo mã nhà xuất bản:", error);
            throw new ApiError(500, "Đã xảy ra lỗi khi tạo mã nhà xuất bản");
        }
    }

    // Hàm tạo nhà xuất bản mới
    async create(payload) {
        // Kiểm tra tên nhà xuất bản đã tồn tại chưa
        const nameExists = await this.Nhaxuatban.findOne({ tennxb: payload.tennxb });
        if (nameExists) {
            throw new ApiError(400, "Tên nhà xuất bản đã tồn tại");
        }

        // Tạo mã nhà xuất bản mới
        const manxb = await this.generateManxb();
        const nhaxuatban = {
            manxb,
            tennxb: payload.tennxb,
            diachi: payload.diachi,
        };

        const result = await this.Nhaxuatban.insertOne(nhaxuatban);
        if (result.insertedId) {
            return await this.Nhaxuatban.findOne({ _id: result.insertedId });
        } else {
            throw new ApiError(500, "Không thể tạo nhà xuất bản");
        }
    }

    // Hàm tìm tất cả nhà xuất bản
    async findAll() {
        return await this.Nhaxuatban.find({}).toArray();
    }

    // Hàm tìm một nhà xuất bản theo mã
    async findOne(manxb) {
        const nhaxuatban = await this.Nhaxuatban.findOne({ manxb });
        if (!nhaxuatban) {
            throw new ApiError(404, `Không tìm thấy nhà xuất bản với mã ${manxb}`);
        }
        return nhaxuatban;
    }

    // Hàm cập nhật thông tin nhà xuất bản
    async update(manxb, updateData) {
        const existingNhaxuatban = await this.findOne(manxb);

        // Kiểm tra tên nhà xuất bản có trùng không khi cập nhật
        if (updateData.tennxb) {
            const nameExists = await this.Nhaxuatban.findOne({
                tennxb: updateData.tennxb,
                manxb: { $ne: manxb },
            });
            if (nameExists) {
                throw new ApiError(400, "Tên nhà xuất bản đã tồn tại");
            }
        }

        // Cập nhật thông tin nhà xuất bản
        await this.Nhaxuatban.updateOne({ manxb }, { $set: updateData });
        return await this.findOne(manxb);
    }

    // Hàm xóa nhà xuất bản
    async delete(manxb) {
        const result = await this.Nhaxuatban.deleteOne({ manxb });
        if (result.deletedCount === 0) {
            throw new ApiError(404, `Không tìm thấy nhà xuất bản với mã ${manxb}`);
        }
        return result;
    }

    // Hàm xóa tất cả nhà xuất bản
    async deleteAll() {
        const result = await this.Nhaxuatban.deleteMany({});
        if (result.deletedCount === 0) {
            throw new ApiError(404, "Không có nhà xuất bản nào để xoá");
        }
        return result;
    }
}

module.exports = NhaxuatbanService;
