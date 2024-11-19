const { ObjectId } = require("mongodb");
const ApiError = require("../api-errors");
const NhaxuatbanService = require("../services/nhaxuatban.service");

class SachService {
    constructor(client) {
        this.Sach = client.db().collection("sach");
        this.nhaxuatbanService = new NhaxuatbanService(client);
    }

    // Hàm tạo mã sách tự động, kiểm tra mã trống để tái sử dụng
    async generateMasach() {
        try {
            // Lấy tất cả mã sách đã tồn tại, bao gồm cả sách đã bị xóa
            const existingBooks = await this.Sach.find().sort({ masach: 1 }).toArray();

            let availableMasach = null;

            // Duyệt qua danh sách mã sách để kiểm tra những mã nào bị trống
            for (let i = 0; i < existingBooks.length - 1; i++) {
                const currentMasach = existingBooks[i].masach;
                const nextMasach = existingBooks[i + 1].masach;

                // Kiểm tra nếu có mã sách trống (giữa các mã sách liên tiếp)
                const currentNumber = parseInt(currentMasach.replace("S", ""));
                const nextNumber = parseInt(nextMasach.replace("S", ""));

                if (nextNumber - currentNumber > 1) {
                    availableMasach = `S${(currentNumber + 1).toString().padStart(3, "0")}`;
                    break;
                }
            }

            // Nếu không có mã trống thì tạo mã mới tiếp theo
            if (!availableMasach) {
                const lastSach = existingBooks[existingBooks.length - 1];
                const lastMasach = lastSach ? lastSach.masach : "S000";
                const lastNumber = parseInt(lastMasach.replace("S", ""));
                const nextNumber = lastNumber + 1;
                availableMasach = `S${nextNumber.toString().padStart(3, "0")}`;
            }

            return availableMasach;
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
            isDeleted: false,  // Thêm trường isDeleted
        };

        const result = await this.Sach.insertOne(sach);
        if (result.insertedId) {
            return await this.Sach.findOne({ masach: sach.masach });
        } else {
            throw new ApiError(500, "Không thể tạo sách");
        }
    }

    // Hàm tìm tất cả sách chưa bị xóa
    async findAll() {
        return await this.Sach.aggregate([
            {
                $match: { isDeleted: false },  // Lọc sách chưa bị xóa
            },
            {
                $lookup: {
                    from: "nhaxuatban",
                    localField: "manxb",
                    foreignField: "manxb",  // Kết nối qua manxb
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

    // Hàm tìm sách theo masach chưa bị xóa
    async findOne(masach) {
        const sach = await this.Sach.aggregate([
            {
                $match: { masach: masach, isDeleted: false },  // Lọc sách chưa bị xóa
            },
            {
                $lookup: {
                    from: "nhaxuatban",
                    localField: "manxb",
                    foreignField: "manxb",  // Kết nối qua manxb
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

        return sach[0];
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

        // Tạo đối tượng sách mới từ payload nhưng không thay đổi mã sách và isDeleted
        const sach = { ...payload };

        // Cập nhật sách trong cơ sở dữ liệu
        const result = await this.Sach.findOneAndUpdate(
            { masach: masach, isDeleted: false }, // Tìm sách chưa bị xóa
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

    // Hàm xóa mềm sách (đánh dấu là đã xóa)
    async delete(masach) {
        const result = await this.Sach.updateOne(
            { masach, isDeleted: false },  // Tìm sách chưa bị xóa
            { $set: { isDeleted: true } }  // Cập nhật trường isDeleted thành true
        );

        if (result.modifiedCount === 0) {
            throw new ApiError(404, `Không tìm thấy sách với mã ${masach}`);
        }

        return { message: "Sách đã bị xóa mềm" };
    }

    // Hàm xóa mềm tất cả sách
    async deleteAll() {
        const result = await this.Sach.updateMany(
            { isDeleted: false }, // Chọn tất cả sách chưa bị xóa
            { $set: { isDeleted: true } }  // Cập nhật trường isDeleted thành true
        );

        if (result.modifiedCount === 0) {
            throw new ApiError(404, "Không có sách nào để xóa");
        }

        return {
            message: "Xóa tất cả sách thành công",
            deletedCount: result.modifiedCount,
        };
    }
}

module.exports = SachService;
