const userModel = require('../models/userModels');
const roleModel = require('../models/roleModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


//register callback
const registerController = async (req, res) => {
    try {
        const existingUser = await userModel.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: 'User Already Exist'
            })
        }

        // Find or create customer role
        let customerRole = await roleModel.findOne({ name: 'customer' });
        if (!customerRole) {
            customerRole = new roleModel({ name: 'customer' });
            await customerRole.save();
        }

        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user with customer role
        const newUser = new userModel({
            fullName: req.body.fullName,
            email: req.body.email,
            password: hashedPassword,
            phone: req.body.phone,
            role: customerRole._id
        });

        await newUser.save();
        res.status(201).send({
            message: 'Register Successfully',
            success: true
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: `Register Controller ${error.message}`
        })
    }
};

//login callback
const loginController = async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.body.email }).populate('role');
        if (!user) {
            return res.status(200).send({
                message: 'User not found',
                success: false,
            });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(200).send({
                message: 'Invalid Email or Password',
                success: false,
            });
        }

        // FIX: Add role as string in JWT payload
        const token = jwt.sign({ id: user._id, role: user.role.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).send({
            message: 'Login Success',
            success: true,
            token: token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: `Error in Login Ctrl ${error.message}`
        });
    }
};

const authController = async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.body.userId }).populate('role');
        if (!user) {
            res.status(200).send({
                message: 'User not found',
                success: false
            })
        }
        else {
            res.status(200).send({
                success: true,
                data: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'auth error',
            success: false,
            error
        })
    }
}

module.exports = {
    loginController,
    registerController,
    authController,
};