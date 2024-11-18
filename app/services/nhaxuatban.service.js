const { ObjectId } = require("mongodb");
const ApiError = require("../api-errors");

class NhaxuatbanService {
    constructor(client) {
        this.Nhaxuatban = client.db().collection("nhaxuatban");
    }

    // Hàm tạo mã nhà xuất bản tự động
    async generateManxb() {
        try {
            const lastNhaxuatban = await this.Nhaxuatban.find().sort({ manxb: -1 }).limit(1).toArray();
            const lastManxb = lastNhaxuatban.length > 0 ? lastNhaxuatban[0].manxb : "NXB000";
            const lastNumber = parseInt(lastManxb.replace("NXB", ""));
            const nextNumber = lastNumber + 1;
            return `NXB${nextNumber.toString().padStart(3, "0")}`;
        } catch (error) {
            console.error("Lỗi khi tạo mã nhà xuất bản:", error);
            throw new ApiError(500, "Đã xảy ra lỗi khi tạo mã nhà xuất bản");
        }
    }

    // Hàm tạo nhà xuất bản mới
    async create(payload) {
        const nameExists = await this.Nhaxuatban.findOne({ tennxb: payload.tennxb });
        if (nameExists) {
            throw new ApiError(400, "Tên nhà xuất bản đã tồn tại");
        }

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

        if (updateData.tennxb) {
            const nameExists = await this.Nhaxuatban.findOne({
                tennxb: updateData.tennxb,
                manxb: { $ne: manxb },
            });
            if (nameExists) {
                throw new ApiError(400, "Tên nhà xuất bản đã tồn tại");
            }
        }

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
