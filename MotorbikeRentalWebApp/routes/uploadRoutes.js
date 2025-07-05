const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");

router.post("/upload", upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Không có file nào được tải lên" });
        }

        const fileUrl = `/uploads/${req.file.filename}`;
        console.log("📥 File đã tải lên:", req.file); // Kiểm tra log file
        res.json({ success: true, url: fileUrl });
    } catch (error) {
        console.error("❌ Lỗi upload:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
});


module.exports = router;
