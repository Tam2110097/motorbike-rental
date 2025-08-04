const rentalOrderModel = require('../../models/rentalOrderModels');
const motorbikeTypeModel = require('../../models/motorbikeTypeModels');
const branchModel = require('../../models/branchModels');
const rentalOrderMotorbikeDetailModel = require('../../models/rentalOrderMotorbikeDetailModels');
const mongoose = require('mongoose');

// Get overall sales statistics
const getOverallSalesStatistics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Get all orders (not just completed) for debugging
        const allOrders = await rentalOrderModel.find({
            // status: 'completed', // Temporarily remove this filter
            ...dateFilter
        }).populate('branchReceive branchReturn');

        console.log('Total orders found:', allOrders.length);
        console.log('Order statuses:', allOrders.map(order => order.status));

        // Filter for completed orders for actual stats
        const completedOrders = allOrders.filter(order => order.status === 'completed');

        // Calculate overall statistics
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.grandTotal, 0);
        const totalOrders = completedOrders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Get revenue by month (last 12 months)
        const monthlyRevenue = await rentalOrderModel.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: {
                        $gte: new Date(new Date().getFullYear(), 0, 1) // Start of current year
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    revenue: { $sum: '$grandTotal' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);

        console.log('>>>>>>>>>>>>>>>>Monthly revenue:', monthlyRevenue);
        console.log('Total orders:', totalOrders);
        console.log('Average order value:', averageOrderValue);
        console.log('Total revenue:', totalRevenue);

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                totalOrders,
                averageOrderValue,
                monthlyRevenue
            }
        });
    } catch (error) {
        console.error('Error getting overall sales statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy thống kê tổng quan',
            error: error.message
        });
    }
};

// Get sales statistics by vehicle type
// const getSalesByVehicleType = async (req, res) => {
//     try {
//         const { startDate, endDate } = req.query;

//         // Build date filter for rental orders
//         const dateFilter = {};
//         if (startDate && endDate) {
//             dateFilter.createdAt = {
//                 $gte: new Date(startDate),
//                 $lte: new Date(endDate)
//             };
//         }

//         // Get completed orders first
//         const completedOrders = await rentalOrderModel.find({
//             status: 'completed',
//             ...dateFilter
//         }).select('_id');

//         const completedOrderIds = completedOrders.map(order => order._id);

//         console.log('Completed order IDs:', completedOrderIds);

//         // Get sales data from rentalOrderMotorbikeDetail
//         const salesByType = await rentalOrderMotorbikeDetailModel.aggregate([
//             {
//                 $match: {
//                     rentalOrderId: { $in: completedOrderIds }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'motorbiketypes',
//                     localField: 'motorbikeTypeId',
//                     foreignField: '_id',
//                     as: 'motorbikeType'
//                 }
//             },
//             {
//                 $unwind: '$motorbikeType'
//             },
//             {
//                 $addFields: {
//                     // Calculate revenue using the formula: ((unitPrice + damageWaiverFee) * duration) * quantity
//                     motorbikeRevenue: {
//                         $multiply: [
//                             { $add: ['$unitPrice', { $ifNull: ['$damageWaiverFee', 0] }] },
//                             '$duration',
//                             '$quantity'
//                         ]
//                     }
//                 }
//             },
//             {
//                 $group: {
//                     _id: '$motorbikeType._id',
//                     vehicleTypeName: { $first: '$motorbikeType.name' },
//                     totalRevenue: { $sum: '$motorbikeRevenue' },
//                     totalOrders: { $addToSet: '$rentalOrderId' },
//                     totalQuantity: { $sum: '$quantity' },
//                     averagePrice: { $avg: '$unitPrice' },
//                     totalDamageWaiver: { $sum: { $ifNull: ['$damageWaiverFee', 0] } }
//                 }
//             },
//             {
//                 $addFields: {
//                     totalOrders: { $size: '$totalOrders' }
//                 }
//             },
//             {
//                 $sort: { totalRevenue: -1 }
//             }
//         ]);

//         // console.log('>>>>>>>>>>>>>>>>Sales by type:', totalRevenue);
//         // console.log('>>>>>>>>>>>>>>>>Sales by type:', totalOrders);
//         // console.log('>>>>>>>>>>>>>>>>Sales by type:', totalQuantity);
//         // console.log('>>>>>>>>>>>>>>>>Sales by type:', averagePrice);

//         console.log('>>>>>>>>>>>>>>>>Sales by type:', salesByType);

//         // If no sales data, return all vehicle types with zero values
//         if (salesByType.length === 0) {
//             console.log('No vehicle type sales data found, fetching all vehicle types...');
//             const allVehicleTypes = await motorbikeTypeModel.find({});
//             const vehicleTypesWithZeroSales = allVehicleTypes.map(type => ({
//                 _id: type._id,
//                 vehicleTypeName: type.name,
//                 totalRevenue: 0,
//                 totalOrders: 0,
//                 totalQuantity: 0,
//                 averagePrice: 0,
//                 totalDamageWaiver: 0
//             }));

//             console.log('Vehicle types with zero sales:', vehicleTypesWithZeroSales);

//             res.status(200).json({
//                 success: true,
//                 data: vehicleTypesWithZeroSales
//             });
//         } else {
//             res.status(200).json({
//                 success: true,
//                 data: salesByType
//             });
//         }
//     } catch (error) {
//         console.error('Error getting sales by vehicle type:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Có lỗi xảy ra khi lấy thống kê theo loại xe',
//             error: error.message
//         });
//     }
// };

const getSalesByVehicleType = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Step 1: Get all completed rental orders in time range
        const completedOrders = await rentalOrderModel.find({
            status: 'completed',
            ...dateFilter
        }).select('_id');

        const completedOrderIds = completedOrders.map(order => order._id);

        if (completedOrderIds.length === 0) {
            // No completed orders => return all vehicle types with zero values
            const allVehicleTypes = await motorbikeTypeModel.find({});
            const vehicleTypesWithZeroSales = allVehicleTypes.map(type => ({
                _id: type._id,
                vehicleTypeName: type.name,
                totalRevenue: 0,
                totalOrders: 0,
                totalQuantity: 0,
                averagePrice: 0,
                totalDamageWaiver: 0
            }));

            return res.status(200).json({
                success: true,
                data: vehicleTypesWithZeroSales
            });
        }

        // Step 2: Aggregate from rentalOrderMotorbikeDetail
        const salesByType = await rentalOrderMotorbikeDetailModel.aggregate([
            {
                $match: {
                    rentalOrderId: { $in: completedOrderIds }
                }
            },
            {
                $lookup: {
                    from: 'motorbiketypes',
                    localField: 'motorbikeTypeId',
                    foreignField: '_id',
                    as: 'motorbikeType'
                }
            },
            { $unwind: '$motorbikeType' },
            {
                $addFields: {
                    damageWaiverFeeSafe: { $ifNull: ['$damageWaiverFee', 0] },
                    motorbikeRevenue: {
                        $multiply: [
                            { $add: ['$unitPrice', { $ifNull: ['$damageWaiverFee', 0] }] },
                            '$duration',
                            '$quantity'
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: '$motorbikeType._id',
                    vehicleTypeName: { $first: '$motorbikeType.name' },
                    totalRevenue: { $sum: '$motorbikeRevenue' },
                    orderSet: { $addToSet: '$rentalOrderId' },
                    totalQuantity: { $sum: '$quantity' },
                    averagePrice: { $avg: '$unitPrice' },
                    totalDamageWaiver: { $sum: '$damageWaiverFeeSafe' }
                }
            },
            {
                $addFields: {
                    totalOrders: { $size: '$orderSet' }
                }
            },
            {
                $project: {
                    orderSet: 0 // Ẩn field phụ
                }
            },
            {
                $sort: { totalRevenue: -1 }
            }
        ]);

        // Step 3: Return result
        if (salesByType.length === 0) {
            // No matching detail => vẫn trả về danh sách loại xe với doanh thu 0
            const allVehicleTypes = await motorbikeTypeModel.find({});
            const vehicleTypesWithZeroSales = allVehicleTypes.map(type => ({
                _id: type._id,
                vehicleTypeName: type.name,
                totalRevenue: 0,
                totalOrders: 0,
                totalQuantity: 0,
                averagePrice: 0,
                totalDamageWaiver: 0
            }));

            return res.status(200).json({
                success: true,
                data: vehicleTypesWithZeroSales
            });
        }

        return res.status(200).json({
            success: true,
            data: salesByType
        });
    } catch (error) {
        console.error('Error getting sales by vehicle type:', error);
        return res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy thống kê theo loại xe',
            error: error.message
        });
    }
};


// Get sales statistics by branch
const getSalesByBranch = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // First, let's check if there are any completed orders
        const completedOrdersCount = await rentalOrderModel.countDocuments({
            status: 'completed',
            ...dateFilter
        });

        console.log('Completed orders count:', completedOrdersCount);

        // Get all orders to see what statuses exist
        const allOrdersStatuses = await rentalOrderModel.distinct('status');
        console.log('All order statuses:', allOrdersStatuses);

        // Get sample orders to see the structure
        const sampleOrders = await rentalOrderModel.find({}).limit(3);
        console.log('Sample orders:', JSON.stringify(sampleOrders, null, 2));

        // Try with all statuses first to see if there are any orders
        const salesByBranch = await rentalOrderModel.aggregate([
            {
                $match: {
                    status: 'completed',
                    ...dateFilter
                }
            },
            {
                $lookup: {
                    from: 'branches',
                    localField: 'branchReceive',
                    foreignField: '_id',
                    as: 'branchReceive'
                }
            },
            {
                $unwind: '$branchReceive'
            },
            {
                $group: {
                    _id: '$branchReceive._id',
                    branchName: { $first: '$branchReceive.city' },
                    branchAddress: { $first: '$branchReceive.address' },
                    totalRevenue: { $sum: '$grandTotal' },
                    totalOrders: { $sum: 1 },
                    averageOrderValue: { $avg: '$grandTotal' }
                }
            },
            {
                $sort: { totalRevenue: -1 }
            }
        ]);

        console.log('Sales by branch result:', JSON.stringify(salesByBranch, null, 2));

        // If no sales data, return all branches with zero values
        if (salesByBranch.length === 0) {
            console.log('No sales data found, fetching all branches...');
            const allBranches = await branchModel.find({});
            const branchesWithZeroSales = allBranches.map(branch => ({
                _id: branch._id,
                branchName: branch.name,
                branchAddress: branch.address,
                totalRevenue: 0,
                totalOrders: 0,
                averageOrderValue: 0
            }));

            console.log('Branches with zero sales:', branchesWithZeroSales);

            res.status(200).json({
                success: true,
                data: branchesWithZeroSales
            });
        } else {
            res.status(200).json({
                success: true,
                data: salesByBranch
            });
        }
    } catch (error) {
        console.error('Error getting sales by branch:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy thống kê theo chi nhánh',
            error: error.message
        });
    }
};

// Get detailed sales statistics by vehicle type and branch
const getSalesByVehicleTypeAndBranch = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const salesByTypeAndBranch = await rentalOrderModel.aggregate([
            {
                $match: {
                    status: 'completed',
                    ...dateFilter
                }
            },
            {
                $unwind: '$motorbikes'
            },
            {
                $lookup: {
                    from: 'motorbiketypes',
                    localField: 'motorbikes.motorbikeTypeId',
                    foreignField: '_id',
                    as: 'motorbikeType'
                }
            },
            {
                $unwind: '$motorbikeType'
            },
            {
                $lookup: {
                    from: 'branches',
                    localField: 'branchReceive',
                    foreignField: '_id',
                    as: 'branchReceive'
                }
            },
            {
                $unwind: '$branchReceive'
            },
            {
                $addFields: {
                    // Calculate revenue for this motorbike: (pricePerDay * quantity) + damage waiver if applicable
                    motorbikeRevenue: {
                        $add: [
                            { $multiply: ['$motorbikes.pricePerDay', '$motorbikes.quantity'] },
                            {
                                $cond: {
                                    if: '$motorbikes.hasDamageWaiver',
                                    then: { $multiply: ['$motorbikes.pricePerDay', '$motorbikes.quantity', 0.1] }, // 10% damage waiver
                                    else: 0
                                }
                            }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: {
                        vehicleTypeId: '$motorbikeType._id',
                        vehicleTypeName: '$motorbikeType.name',
                        branchId: '$branchReceive._id',
                        branchName: '$branchReceive.city'
                    },
                    totalRevenue: { $sum: '$motorbikeRevenue' },
                    totalOrders: { $sum: 1 },
                    totalQuantity: { $sum: '$motorbikes.quantity' },
                    averagePrice: { $avg: '$motorbikes.pricePerDay' },
                    totalDamageWaiver: {
                        $sum: {
                            $cond: {
                                if: '$motorbikes.hasDamageWaiver',
                                then: { $multiply: ['$motorbikes.pricePerDay', '$motorbikes.quantity', 0.1] },
                                else: 0
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$_id.vehicleTypeId',
                    vehicleTypeName: { $first: '$_id.vehicleTypeName' },
                    branches: {
                        $push: {
                            branchId: '$_id.branchId',
                            branchName: '$_id.branchName',
                            totalRevenue: '$totalRevenue',
                            totalOrders: '$totalOrders',
                            totalQuantity: '$totalQuantity',
                            averagePrice: '$averagePrice',
                            totalDamageWaiver: '$totalDamageWaiver'
                        }
                    },
                    totalRevenue: { $sum: '$totalRevenue' },
                    totalOrders: { $sum: '$totalOrders' },
                    totalQuantity: { $sum: '$totalQuantity' }
                }
            },
            {
                $sort: { totalRevenue: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: salesByTypeAndBranch
        });
    } catch (error) {
        console.error('Error getting sales by vehicle type and branch:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy thống kê chi tiết',
            error: error.message
        });
    }
};

// Get recent orders for dashboard
const getRecentOrders = async (req, res) => {
    try {
        const recentOrders = await rentalOrderModel.find({})
            .populate('branchReceive branchReturn')
            .populate('motorbikes.motorbikeTypeId')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: recentOrders
        });
    } catch (error) {
        console.error('Error getting recent orders:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy đơn hàng gần đây',
            error: error.message
        });
    }
};

// Get top performing vehicle types
const getTopPerformingVehicleTypes = async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        const topTypes = await rentalOrderModel.aggregate([
            {
                $match: { status: 'completed' }
            },
            {
                $unwind: '$motorbikes'
            },
            {
                $lookup: {
                    from: 'motorbiketypes',
                    localField: 'motorbikes.motorbikeTypeId',
                    foreignField: '_id',
                    as: 'motorbikeType'
                }
            },
            {
                $unwind: '$motorbikeType'
            },
            {
                $addFields: {
                    // Calculate revenue for this motorbike: (pricePerDay * quantity) + damage waiver if applicable
                    motorbikeRevenue: {
                        $add: [
                            { $multiply: ['$motorbikes.pricePerDay', '$motorbikes.quantity'] },
                            {
                                $cond: {
                                    if: '$motorbikes.hasDamageWaiver',
                                    then: { $multiply: ['$motorbikes.pricePerDay', '$motorbikes.quantity', 0.1] }, // 10% damage waiver
                                    else: 0
                                }
                            }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: '$motorbikeType._id',
                    name: { $first: '$motorbikeType.name' },
                    totalRevenue: { $sum: '$motorbikeRevenue' },
                    totalOrders: { $sum: 1 },
                    totalQuantity: { $sum: '$motorbikes.quantity' },
                    totalDamageWaiver: {
                        $sum: {
                            $cond: {
                                if: '$motorbikes.hasDamageWaiver',
                                then: { $multiply: ['$motorbikes.pricePerDay', '$motorbikes.quantity', 0.1] },
                                else: 0
                            }
                        }
                    }
                }
            },
            {
                $sort: { totalRevenue: -1 }
            },
            {
                $limit: parseInt(limit)
            }
        ]);

        res.status(200).json({
            success: true,
            data: topTypes
        });
    } catch (error) {
        console.error('Error getting top performing vehicle types:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy top loại xe',
            error: error.message
        });
    }
};

module.exports = {
    getOverallSalesStatistics,
    getSalesByVehicleType,
    getSalesByBranch,
    getSalesByVehicleTypeAndBranch,
    getRecentOrders,
    getTopPerformingVehicleTypes
}; 