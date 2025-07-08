const branchModel = require('../../models/branchModels');

const getAllBranches = async (req, res) => {
    try {
        const branches = await branchModel.find();
        res.status(200).send({
            success: true,
            message: 'Lấy danh sách thành phố thành công',
            branches
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Lấy danh sách thành phố thất bại',
            error
        });
    }
}

const getBranchById = async (req, res) => {
    try {
        const { id } = req.params;
        const branch = await branchModel.findById(id);
        res.status(200).send({
            success: true,
            message: 'Lấy thành phố thành công',
            branch
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Lấy thành phố thất bại',
            error
        });
    }
}
module.exports = { getAllBranches, getBranchById };