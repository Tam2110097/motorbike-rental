const userModel = require('../../models/userModels');
const roleModel = require('../../models/roleModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create account controller
const createAccount = async (req, res) => {
    try {
        console.log('>>>>>>>>>>>>>>>>', req.body);
        const { fullName, email, password, phone, roleName } = req.body;

        // Validate required fields
        if (!fullName || !email || !password || !phone || !roleName) {
            return res.status(400).json({
                success: false,
                message: 'Tất cả các trường là bắt buộc',
                missingFields: {
                    fullName: !fullName,
                    email: !email,
                    password: !password,
                    phone: !phone,
                    roleName: !roleName
                }
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email không hợp lệ'
            });
        }

        // Validate roleName
        const validRoleNames = ['admin', 'employee', 'customer'];
        if (!validRoleNames.includes(roleName)) {
            return res.status(400).json({
                success: false,
                message: 'Loại người dùng không hợp lệ'
            });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email đã tồn tại trong hệ thống'
            });
        }

        // Find or create role
        let role = await roleModel.findOne({ name: roleName });
        if (!role) {
            role = new roleModel({ name: roleName });
            await role.save();
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new userModel({
            fullName,
            email,
            password: hashedPassword,
            phone,
            role: role._id
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'Tạo tài khoản thành công',
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                phone: newUser.phone,
                role: role
            }
        });

    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Get all users controller
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).populate('role').select('-password');

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách người dùng thành công',
            users
        });

    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Get user by ID controller
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id).populate('role').select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lấy thông tin người dùng thành công',
            user
        });

    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Update user controller
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, phone, roleName } = req.body;

        // Check if user exists
        const existingUser = await userModel.findById(id);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Check if email is being changed and if it already exists
        if (email && email !== existingUser.email) {
            const emailExists = await userModel.findOne({ email });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email đã tồn tại trong hệ thống'
                });
            }
        }

        // Find or create role
        let role = await roleModel.findOne({ name: roleName });
        if (!role) {
            role = new roleModel({ name: roleName });
            await role.save();
        }

        // Update user
        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            {
                fullName,
                email,
                phone,
                role: role._id
            },
            { new: true }
        ).populate('role').select('-password');

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin người dùng thành công',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Delete user controller
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const existingUser = await userModel.findById(id);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Delete user
        await userModel.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Xóa người dùng thành công'
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Change password controller
const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        // Check if user exists
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await userModel.findByIdAndUpdate(id, { password: hashedNewPassword });

        res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });

    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

module.exports = {
    createAccount,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changePassword
};

