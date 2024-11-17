const ProducerService = require("../services/producer.service");
const ApiError = require("../api-errors");
const MongoDB = require("../utils/mongodb.util");

// Hàm tạo nhà xuất bản mới
exports.create = async (req, res, next) => {
    // Kiểm tra xem các trường dữ liệu có bị thiếu không
    if (!req.body?.tennxb || !req.body?.diachi) {
        return next(new ApiError(400, "All fields cannot be empty"));
    }

    try {
        const producerService = new ProducerService(MongoDB.client);

        // Gọi phương thức create từ producerService
        const producer = await producerService.create(req.body);

        // Trả về thông tin nhà xuất bản đã được tạo
        return res.status(201).send({
            message: "Producer created successfully",
            producer: producer
        });
    } catch (error) {
        // Xử lý lỗi nếu có
        return next(error);  // Chuyển lỗi tới middleware để xử lý và trả về phản hồi chính xác
    }
};


// Hàm lấy danh sách tất cả các nhà xuất bản
exports.findAll = async (req, res, next) => {
    try {
        const producerService = new ProducerService(MongoDB.client);
        const producerList = await producerService.findAll();

        // Nếu không có nhà xuất bản nào trong cơ sở dữ liệu
        if (producerList.length === 0) {
            return res.status(404).send({
                message: "No producers found",
            });
        }

        return res.status(200).send(producerList); // Trả về danh sách nhà xuất bản
    } catch (error) {
        console.error("Error fetching producer list:", error);
        return next(new ApiError(500, "An error occurred while retrieving the producer list"));
    }
};


// Hàm tìm một nhà xuất bản theo mã nhà xuất bản (manxb)
exports.findOne = async (req, res, next) => {
    const manxb = req.params.manxb; // Lấy manxb từ URL parameters

    if (!manxb) {
        return next(new ApiError(400, "manxb parameter is required"));
    }

    try {
        const producerService = new ProducerService(MongoDB.client);
        const producer = await producerService.findOne(manxb); // Tìm nhà xuất bản theo manxb

        // Kiểm tra nếu không tìm thấy nhà xuất bản
        if (!producer) {
            return next(new ApiError(404, `Producer with manxb ${manxb} not found`));
        }

        return res.status(200).send({
            message: "Producer found successfully",
            producer: producer, // Trả về thông tin nhà xuất bản
        });
    } catch (error) {
        return next(error); // Để xử lý lỗi
    }
};



// Hàm cập nhật thông tin nhà xuất bản theo manxb
exports.update = async (req, res, next) => {
    const { manxb } = req.params; // Lấy manxb từ URL
    const updateData = req.body; // Lấy dữ liệu cập nhật từ request body

    try {
        const producerService = new ProducerService(MongoDB.client);
        const updatedProducer = await producerService.update(manxb, updateData);

        return res.status(200).send({
            message: "Producer updated successfully",
            producer: updatedProducer,
        });
    } catch (error) {
        console.error("Error updating producer:", error);
        return next(error); // Xử lý lỗi thông qua middleware
    }
};


// Hàm xóa một nhà xuất bản
exports.delete = async (req, res, next) => {
    const { manxb } = req.params; // Lấy manxb từ URL params

    try {
        const producerService = new ProducerService(MongoDB.client);

        // Tìm nhà xuất bản theo manxb
        const producer = await producerService.findOne(manxb);

        // Nếu không tìm thấy nhà xuất bản, trả về lỗi 404
        if (!producer) {
            return res.status(404).send({
                message: `Producer with manxb ${manxb} not found`,
            });
        }

        // Tiến hành xóa nhà xuất bản
        const result = await producerService.delete(manxb);

        // Nếu xóa thành công, trả về thông báo thành công
        return res.status(200).send({
            message: `Producer with manxb ${manxb} has been deleted successfully`,
        });
    } catch (error) {
        console.error("Error deleting producer:", error);
        return next(new ApiError(500, "An error occurred while deleting the producer"));
    }
};


// Hàm xóa tất cả các nhà xuất bản
exports.deleteAll = async (req, res, next) => {
    try {
        const producerService = new ProducerService(MongoDB.client);
        const result = await producerService.deleteAll();

        if (result.deletedCount === 0) {
            return res.status(404).send({
                message: "No producers found to delete",
            });
        }

        return res.status(200).send({
            message: `${result.deletedCount} producer(s) were deleted successfully`,
        });
    } catch (error) {
        console.error("Error deleting all producers:", error);
        return next(new ApiError(500, "An error occurred while deleting all producers"));
    }
};
