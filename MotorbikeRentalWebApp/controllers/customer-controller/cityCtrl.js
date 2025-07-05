const branchModel = require('../../models/branchModels');

const getAllCities = async (req, res) => {
    try {
        const cities = await branchModel.find();
        res.status(200).send({
            success: true,
            message: 'Lấy danh sách thành phố thành công',
            cities
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Lấy danh sách thành phố thất bại',
            error
        });
    }
}

module.exports = { getAllCities };