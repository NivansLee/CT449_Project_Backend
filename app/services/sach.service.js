const { ObjectId } = require("mongodb");
const ApiError = require("../api-errors");
const NhaxuatbanService = require("../services/nhaxuatban.service");

class SachService {
    constructor(client) {
        this.Sach = client.db().collection("sach");
        this.nhaxuatbanService = new NhaxuatbanService(client);
    }

    // Hàm tạo mã sách tự động
    async generateMasach() {
        try {
            const lastSach = await this.Sach.find().sort({ masach: -1 }).limit(1).toArray();
            const lastMasach = lastSach.length > 0 ? lastSach[0].masach : "S000";
            const lastNumber = parseInt(lastMasach.replace("S", ""));
            const nextNumber = lastNumber + 1;
            return `S${nextNumber.toString().padStart(3, "0")}`;
        } catch (error) {
            console.error("Lỗi khi tạo mã sách:", error);
            throw new ApiError(500, "Đã xảy ra lỗi khi tạo mã sách");
        }
    }

    // Hàm tạo sách mới
    async create(payload) {
        const existingBook = await this.Sach.findOne({
            tensach: payload.tensach,
            tacgia: payload.tacgia,
        });

        // Nếu tên sách và tên tác giả đều trùng, báo lỗi
        if (existingBook) {
            throw new ApiError(400, "Tên sách và tác giả đã tồn tại");
        }

        const masach = await this.generateMasach();

        // Kiểm tra và tạo nhà xuất bản nếu chưa có
        const nhaxuatban = await this.nhaxuatbanService.findOne(payload.manxb);
        if (!nhaxuatban) {
            throw new ApiError(404, `Nhà xuất bản với mã ${payload.manxb} không tồn tại.`);
        }

        const sach = {
            masach,
            tensach: payload.tensach,
            dongia: payload.dongia,
            soquyen: payload.soquyen,
            namxuatban: payload.namxuatban,
            manxb: payload.manxb, // Lưu manxb trực tiếp thay vì ObjectId
            tacgia: payload.tacgia,
            imagebook: payload.imagebook,
        };

        const result = await this.Sach.insertOne(sach);
        if (result.insertedId) {
            return await this.Sach.findOne({ masach: sach.masach });
        } else {
            throw new ApiError(500, "Không thể tạo sách");
        }
    }

    // Hàm tìm tất cả sách
    async findAll() {
        return await this.Sach.aggregate([
            {
                $lookup: {
                    from: "nhaxuatban",
                    localField: "manxb",
                    foreignField: "manxb", // Kết nối qua manxb
                    as: "nhaxuatban",
                },
            },
            {
                $unwind: {
                    path: "$nhaxuatban",
                    preserveNullAndEmptyArrays: true,
                },
            },
        ]).toArray();
    }

    // Hàm tìm sách theo masach
    async findOne(masach) {
        const sach = await this.Sach.aggregate([
            {
                $match: { masach: masach }, // Tìm sách theo mã
            },
            {
                $lookup: {
                    from: "nhaxuatban",
                    localField: "manxb",
                    foreignField: "manxb", // Kết nối qua manxb
                    as: "nhaxuatban",
                },
            },
            {
                $unwind: {
                    path: "$nhaxuatban",
                    preserveNullAndEmptyArrays: true,
                },
            },
        ]).toArray();

        if (sach.length === 0) {
            throw new ApiError(404, `Sách với mã ${masach} không tồn tại.`);
        }

        return sach[0]; // Trả về sách đã kết hợp với nhà xuất bản
    }

    // Hàm cập nhật thông tin sách
    async update(masach, payload) {
        // Kiểm tra sách khác có tên và tác giả giống với sách đang được cập nhật
        const existingBook = await this.Sach.findOne({
            tensach: payload.tensach,
            tacgia: payload.tacgia,
            masach: { $ne: masach }, // Loại trừ sách đang cập nhật
        });

        // Nếu tên sách và tác giả đều trùng, báo lỗi
        if (existingBook) {
            throw new ApiError(400, "Tên sách và tác giả đã tồn tại");
        }

        // Tạo đối tượng sách mới từ payload nhưng không thay đổi mã sách
        const sach = { ...payload };

        // Cập nhật sách trong cơ sở dữ liệu
        const result = await this.Sach.findOneAndUpdate(
            { masach: masach }, // Tìm sách bằng mã sách
            { $set: sach },
            { returnDocument: "after" } // Trả về tài liệu sau khi cập nhật
        );

        // Kiểm tra kết quả, nếu không có sách nào được tìm thấy
        if (!result) {
            throw new ApiError(404, `Sách với mã ${masach} không tồn tại.`);
        }

        // Trả về sách đã cập nhật (nếu có thay đổi) hoặc payload (nếu không thay đổi)
        return result.value || payload;
    }

    // Hàm xóa sách (xóa vĩnh viễn)
    async delete(masach) {
        const result = await this.Sach.deleteOne({ masach });
        if (result.deletedCount === 0) {
            throw new ApiError(404, `Không tìm thấy sách với mã ${masach}`);
        }
        return result;
    }


    // Hàm xóa tất cả sách (xóa vĩnh viễn)
    async deleteAll() {
        const result = await this.Sach.deleteMany({}); // Xóa tất cả sách

        if (result.deletedCount === 0) {
            throw new ApiError(404, "Không có sách nào để xóa");
        }

        return {
            message: "Xóa tất cả sách thành công",
            deletedCount: result.deletedCount,
        };
    }
}

module.exports = SachService;
