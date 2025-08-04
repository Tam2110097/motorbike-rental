const express = require("express");
const cors = require("cors");
const colors = require("colors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const uploadRoutes = require("./routes/uploadRoutes");
const http = require("http");
const socketIo = require("socket.io");

//cron job
require('./jobs/autoCancelOrders');

// GPS simulation job
const { syncGPSSimulations } = require('./jobs/gpsSimulationJob');

//dotenv config
require("dotenv").config();

//mongodb connection
connectDB();

//rest object
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

//Allow All Origins with Default of cor(*)
app.use(cors());

//middlewares
app.use(express.json());
app.use(morgan('dev'));

//routes
app.use("/api/v1/user", require("./routes/userRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/employee", require("./routes/employeeRoutes"));
app.use("/api/v1/customer", require("./routes/customerRoutes"));
app.use("/api/v1/vnpay", require("./routes/order"));
app.use("/api/v1/recommendation", require("./routes/recommendationRoutes"));
app.use("/api/v1/prediction", require("./routes/prediction"));

app.use("/uploads", express.static("uploads")); // Cho phép truy cập ảnh từ trình duyệt
app.use("/api/v1", uploadRoutes); // Sử dụng route upload

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join a room for location updates
    socket.on('join-location-room', (motorbikeId) => {
        socket.join(`motorbike-${motorbikeId}`);
        console.log(`Client ${socket.id} joined room for motorbike ${motorbikeId}`);
    });

    // Leave location room
    socket.on('leave-location-room', (motorbikeId) => {
        socket.leave(`motorbike-${motorbikeId}`);
        console.log(`Client ${socket.id} left room for motorbike ${motorbikeId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Make io available globally
global.io = io;

// Global error handler for multer errors
app.use((error, req, res, next) => {
    if (error.name === 'MulterError') {
        return res.status(400).json({
            success: false,
            message: 'Lỗi tải lên file: ' + error.message
        });
    }
    next(error);
});

//port
const port = process.env.PORT || 8080;
//listen port
server.listen(port, async () => {
    console.log("============")
    console.log(process.env.PORT)
    console.log(`Server is running in ${process.env.NODE_MODE} mode on port ${process.env.PORT}`.bgCyan.white)
    console.log(`Socket.IO server is running on port ${port}`.bgGreen.white)

    // Sync GPS simulations on server start
    try {
        await syncGPSSimulations();
        console.log('GPS simulations synced on server start'.bgYellow.white);
    } catch (error) {
        console.error('Error syncing GPS simulations on server start:', error);
    }
});