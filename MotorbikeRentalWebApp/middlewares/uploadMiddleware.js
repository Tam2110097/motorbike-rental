const multer = require("multer");

// Counter to ensure unique filenames
let fileCounter = 0;

// Cấu hình nơi lưu trữ file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Lưu vào thư mục uploads/
    },
    filename: function (req, file, cb) {
        // Use timestamp + counter + random string to ensure uniqueness
        fileCounter++;
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const uniqueName = `${timestamp}-${fileCounter}-${randomStr}-${file.originalname}`;
        cb(null, uniqueName); // Đổi tên file để tránh trùng
    },
});

const upload = multer({ storage: storage });

module.exports = upload;
