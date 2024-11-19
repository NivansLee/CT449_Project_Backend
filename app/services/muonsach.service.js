const { ObjectId } = require('mongodb');
const ApiError = require('../api-errors');

class MuonSachService {
    constructor(client) {
        this.client = client;
        this.MuonSach = this.client.db().collection("muonsach");
        this.Docgia = this.client.db().collection("docgia");
        this.Sach = this.client.db().collection("sach");
    }

    // Hàm tạo mã mượn sách tự động
    async generateMamuon() {
        try {
            const existingBorrowings = await this.MuonSach.find().sort({ mamuon: 1 }).toArray();

            let availableMamuon = null;

            for (let i = 0; i < existingBorrowings.length - 1; i++) {
                const currentMamuon = existingBorrowings[i].mamuon;
                const nextMamuon = existingBorrowings[i + 1].mamuon;

                const currentNumber = parseInt(currentMamuon.replace("M", ""));
                const nextNumber = parseInt(nextMamuon.replace("M", ""));

                if (nextNumber - currentNumber > 1) {
                    availableMamuon = `M${(currentNumber + 1).toString().padStart(3, "0")}`;
                    break;
                }
            }

            if (!availableMamuon) {
                const lastBorrowing = existingBorrowings[existingBorrowings.length - 1];
                const lastMamuon = lastBorrowing ? lastBorrowing.mamuon : "M000";
                const lastNumber = parseInt(lastMamuon.replace("M", ""));
                const nextNumber = lastNumber + 1;
                availableMamuon = `M${nextNumber.toString().padStart(3, "0")}`;
            }

            return availableMamuon;
        } catch (error) {
            console.error("Lỗi khi tạo mã mượn sách:", error);
            throw new ApiError(500, "Đã xảy ra lỗi khi tạo mã mượn sách");
        }
    }

    // Hàm chuyển đổi ngày giờ từ ISO string thành định dạng YYYY-MM-DD
    formatDate(dateString) {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];  // Trả về phần ngày, bỏ thời gian
    }

    // Hàm tạo mượn sách mới
    async create(payload) {
        const sach = await this.Sach.findOne({ masach: payload.masach });
        if (!sach) {
            throw new ApiError(404, `Sách với mã ${payload.masach} không tồn tại.`);
        }

        const docgia = await this.Docgia.findOne({ madocgia: payload.madocgia });
        if (!docgia) {
            throw new ApiError(404, `Độc giả với mã ${payload.madocgia} không tồn tại.`);
        }

        if (sach.soquyen <= 0) {
            throw new ApiError(400, `Sách với mã ${payload.masach} hiện không còn quyển nào để mượn.`);
        }

        const mamuon = await this.generateMamuon();

        // Xử lý ngày mượn và ngày hẹn trả
        const today = new Date();
        const ngayTra = payload.ngayTra ? this.formatDate(payload.ngayTra) : null;
        const ngayHenTra = new Date(today);
        ngayHenTra.setDate(today.getDate() + 7);  // Cộng 7 ngày vào ngày mượn

        const muonsach = {
            mamuon, // Tạo mã mượn sách tự động
            madocgia: payload.madocgia, // Mã độc giả
            masach: payload.masach, // Mã sách
            ngayMuon: this.formatDate(today), // Ngày mượn sách, đã chuyển định dạng
            ngayTra, // Ngày trả sách (nếu có), đã chuyển định dạng
            ngayHenTra: this.formatDate(ngayHenTra), // Ngày hẹn trả sách, đã chuyển định dạng
            isReturned: false, // Sách chưa được trả
        };

        const result = await this.MuonSach.insertOne(muonsach);

        // Giảm số lượng sách sau khi mượn thành công
        await this.Sach.updateOne(
            { masach: muonsach.masach },
            { $inc: { soquyen: -1 } }  // Giảm soQuyen đi 1
        );

        return result;
    }

    // Phương thức để lấy tất cả thông tin mượn sách
    async findAll() {
        const result = await this.MuonSach.aggregate([
            {
                $lookup: {
                    from: "docgia",
                    localField: "madocgia",
                    foreignField: "madocgia",
                    as: "docgiaInfo"
                }
            },
            {
                $unwind: {
                    path: "$docgiaInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "sach",
                    localField: "masach",
                    foreignField: "masach",
                    as: "sachInfo"
                }
            },
            {
                $unwind: {
                    path: "$sachInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    mamuon: 1,
                    madocgia: 1,
                    masach: 1,
                    ngayMuon: 1,
                    ngayHenTra: 1,
                    ngayTra: 1,
                    status: 1,
                    docgiaInfo: 1,
                    sachInfo: 1
                }
            }
        ]).toArray();

        return result;
    }

    // Phương thức để tìm thông tin mượn sách theo mamuon
    async findById(mamuon) {
        const result = await this.MuonSach.aggregate([
            {
                $match: { mamuon: mamuon }
            },
            {
                $lookup: {
                    from: "docgia",
                    localField: "madocgia",
                    foreignField: "madocgia",
                    as: "docgiaInfo"
                }
            },
            {
                $unwind: {
                    path: "$docgiaInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "sach",
                    localField: "masach",
                    foreignField: "masach",
                    as: "sachInfo"
                }
            },
            {
                $unwind: {
                    path: "$sachInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    mamuon: 1,
                    madocgia: 1,
                    masach: 1,
                    ngayMuon: 1,
                    ngayHenTra: 1,
                    ngayTra: 1,
                    status: 1,
                    docgiaInfo: 1,
                    sachInfo: 1
                }
            }
        ]).toArray();

        if (!result.length) {
            throw new ApiError(404, `Thông tin mượn sách với mã mượn ${mamuon} không tồn tại.`);
        }

        return result[0];
    }

    // Phương thức để xóa thông tin mượn sách
    async delete(mamuon) {
        const result = await this.MuonSach.findOneAndDelete({ mamuon: mamuon });
        if (!result) {
            throw new ApiError(404, `Thông tin mượn sách với mã mượn ${mamuon} không tồn tại.`);
        }
        return result;
    }

    // Hàm xóa tất cả thông tin mượn sách
    async deleteAll() {
        const result = await this.MuonSach.deleteMany({});

        // Kiểm tra xem có bản ghi nào được xóa không
        if (result.deletedCount === 0) {
            throw new ApiError(404, "Không có thông tin mượn sách nào để xóa.");
        }

        return result.deletedCount;
    }


    // Hàm trả sách
    async returnBook(mamuon) {
        const muonsach = await this.MuonSach.findOne({ mamuon: mamuon });

        if (!muonsach) {
            throw new ApiError(404, `Không tìm thấy thông tin mượn sách với mã mượn ${mamuon}`);
        }

        if (muonsach.isReturned) {
            throw new ApiError(400, `Sách với mã mượn ${mamuon} đã được trả.`);
        }

        const today = new Date();

        const result = await this.MuonSach.findOneAndUpdate(
            { mamuon: mamuon },
            {
                $set: {
                    isReturned: true,
                    ngayTra: this.formatDate(today),  // Cập nhật ngày trả sách
                }
            },
            { returnDocument: "after" }
        );

        await this.Sach.updateOne(
            { masach: muonsach.masach },
            { $inc: { soquyen: 1 } }
        );

        return result;
    }
}

module.exports = MuonSachService;
