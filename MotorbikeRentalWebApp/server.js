const express = require("express");
const cors = require("cors");
const colors = require("colors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const uploadRoutes = require("./routes/uploadRoutes");

//dotenv config
require("dotenv").config();

//mongodb connection
connectDB();

//rest object
const app = express();

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

app.use("/uploads", express.static("uploads")); // Cho phép truy cập ảnh từ trình duyệt
app.use("/api/v1", uploadRoutes); // Sử dụng route upload

//port
const port = process.env.PORT || 8080;
//listen port
app.listen(port, () => {
    console.log("============")
    console.log(process.env.PORT)
    console.log(`Server is running in ${process.env.NODE_MODE} mode on port ${process.env.PORT}`.bgCyan.white)
});