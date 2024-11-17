const { ObjectId } = require("mongodb");
const ApiError = require("../api-errors");

class ProducerService {
    constructor(client) {
        this.Producer = client.db().collection("producer");
    }

    // Hàm tạo mã nhà xuất bản tự động
    async generateManxb() {
        try {
            const lastProducer = await this.Producer.find().sort({ manxb: -1 }).limit(1).toArray();

            // Kiểm tra nếu không có nhà xuất bản nào trong cơ sở dữ liệu
            const lastManxb = lastProducer.length > 0 ? lastProducer[0].manxb : "NXB000";
            const lastNumber = parseInt(lastManxb.replace("NXB", ""));
            const nextNumber = lastNumber + 1;
            return `NXB${nextNumber.toString().padStart(3, "0")}`;
        } catch (error) {
            console.error("Error generating manxb:", error);
            throw new ApiError(500, "An error occurred while generating manxb");
        }
    }

    // Hàm tạo nhà xuất bản mới
    async create(payload) {
        try {
            // Kiểm tra nếu tên nhà xuất bản đã tồn tại
            const nameExists = await this.Producer.findOne({ tennxb: payload.tennxb });
            if (nameExists) {
                throw new ApiError(400, "Producer name already exists");
            }

            // Tạo mã nhà xuất bản tự động
            const manxb = await this.generateManxb();

            // Tạo đối tượng nhà xuất bản
            const producer = {
                manxb, // Đảm bảo manxb là trường đầu tiên
                tennxb: payload.tennxb,
                diachi: payload.diachi,
            };

            // Thêm nhà xuất bản mới vào collection "producer"
            const result = await this.Producer.insertOne(producer);

            // Trả về thông tin nhà xuất bản mới được thêm vào cơ sở dữ liệu, bao gồm manxb
            if (result.insertedId) {
                const newProducer = await this.Producer.findOne({ _id: result.insertedId });
                return newProducer; // Trả về thông tin nhà xuất bản đã được tạo
            } else {
                throw new ApiError(500, "Failed to create producer");
            }
        } catch (error) {
            // Log lỗi ra console để dễ dàng theo dõi khi có sự cố
            console.error("Error creating producer:", error);
            throw error instanceof ApiError ? error : new ApiError(500, "An error occurred while creating the producer");
        }
    }

    // Hàm tìm tất cả nhà xuất bản
    async findAll() {
        const producerList = await this.Producer.find({}).toArray();
        return producerList;
    }

    // Hàm tìm một nhà xuất bản theo manxb
    async findOne(manxb) {
        try {
            const producer = await this.Producer.findOne({ manxb });
            return producer;
        } catch (error) {
            console.error("Error finding producer:", error);
            throw new ApiError(500, "An error occurred while finding the producer");
        }
    }

    // Hàm cập nhật thông tin nhà xuất bản
    async update(manxb, updateData) {
        try {
            // Tìm kiếm nhà xuất bản trước khi kiểm tra tên hoặc các trường khác
            const existingProducer = await this.Producer.findOne({ manxb });
            if (!existingProducer) {
                throw new ApiError(404, `Producer with manxb ${manxb} not found`);
            }

            // Kiểm tra trùng tên nhà xuất bản (nếu có yêu cầu cập nhật tên)
            if (updateData.tennxb) {
                const nameExists = await this.Producer.findOne({
                    tennxb: updateData.tennxb,
                    manxb: { $ne: manxb }, // Loại trừ nhà xuất bản hiện tại
                });
                if (nameExists) {
                    throw new ApiError(400, "Producer name already exists");
                }
            }

            // Thực hiện cập nhật dữ liệu nhà xuất bản
            const result = await this.Producer.updateOne(
                { manxb }, // Tìm kiếm bằng manxb
                { $set: updateData } // Cập nhật dữ liệu
            );

            // Nếu không có thay đổi dữ liệu, vẫn trả về nhà xuất bản hiện tại
            if (result.modifiedCount === 0) {
                return existingProducer; // Trả về thông tin nhà xuất bản hiện tại
            }

            // Trả về thông tin nhà xuất bản đã được cập nhật
            const updatedProducer = await this.Producer.findOne({ manxb });
            return updatedProducer;
        } catch (error) {
            console.error("Error updating producer:", error);
            throw error instanceof ApiError
                ? error
                : new ApiError(500, "An error occurred while updating the producer");
        }
    }

    // Hàm xoá 1 nhà xuất bản theo manxb
    async delete(manxb) {
        try {
            // Xóa nhà xuất bản theo manxb
            const result = await this.Producer.deleteOne({ manxb });

            // Kiểm tra xem có xóa được nhà xuất bản không
            if (result.deletedCount === 0) {
                // Nếu không xóa được nhà xuất bản, trả về null
                return null;
            }

            // Trả về thông tin nhà xuất bản đã bị xóa
            return result;
        } catch (error) {
            console.error("Error deleting producer:", error);
            throw new ApiError(500, "An error occurred while deleting the producer");
        }
    }


    // Hàm xóa tất cả nhà xuất bản
    async deleteAll() {
        const result = await this.Producer.deleteMany({});
        return result;
    }
}

module.exports = ProducerService;
