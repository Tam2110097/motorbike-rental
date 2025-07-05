const branchModel = require('../../models/branchModels');

// Create a new branch
const createBranch = async (req, res) => {
    try {
        const { city, address, phone, isActive } = req.body;
        if (!city || !address || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ thông tin chi nhánh'
            });
        }
        const newBranch = new branchModel({
            city,
            address,
            phone,
            isActive: isActive !== undefined ? isActive : true
        });
        await newBranch.save();
        res.status(201).json({
            success: true,
            message: 'Tạo chi nhánh thành công',
            branch: newBranch
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Get all branches
const getAllBranches = async (req, res) => {
    try {
        const branches = await branchModel.find();
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách chi nhánh thành công',
            branches
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Get branch by ID
const getBranchById = async (req, res) => {
    try {
        const { id } = req.params;
        const branch = await branchModel.findById(id);
        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chi nhánh'
            });
        }
        res.status(200).json({
            success: true,
            branch
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Update branch
const updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { city, address, phone, isActive } = req.body;
        const updatedBranch = await branchModel.findByIdAndUpdate(
            id,
            { city, address, phone, isActive },
            { new: true }
        );
        if (!updatedBranch) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chi nhánh'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Cập nhật chi nhánh thành công',
            branch: updatedBranch
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Delete branch
const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBranch = await branchModel.findByIdAndDelete(id);
        if (!deletedBranch) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chi nhánh'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Xóa chi nhánh thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

module.exports = {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch
};