const multer = require("multer");

// Cấu hình nơi lưu trữ file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Lưu vào thư mục uploads/
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Đổi tên file để tránh trùng
    },
});

const upload = multer({ storage: storage });

module.exports = upload;
