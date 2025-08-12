import React from 'react'
import { Button, Form, Input, message } from 'antd'
import '../styles/RegisterStyles.css'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { showLoading, hideLoading } from '../redux/features/alertSlice'
import axios from 'axios'

const Register = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const onFinishHandler = async (values) => {
        try {
            dispatch(showLoading())
            const res = await axios.post('http://localhost:8080/api/v1/user/register', values)
            dispatch(hideLoading())
            if (res.data.success) {
                message.success('Đăng ký thành công!')
                navigate('/login')
            }
            else {
                message.error(res.data.message)
            }
        } catch (error) {
            dispatch(hideLoading())
            console.log(error);
            if (error.response?.data?.message) {
                message.error(error.response.data.message)
            } else {
                message.error('Đã xảy ra lỗi khi đăng ký')
            }
        }
    }

    return (
        <div className="form-container">
            <Form layout='vertical' onFinish={onFinishHandler} className="register-form">
                <h3 className='text-center'>Đăng Ký</h3>
                <Form.Item
                    label='Họ và tên'
                    name="fullName"
                    rules={[
                        { required: true, message: 'Vui lòng nhập họ và tên!' }
                    ]}
                >
                    <Input type='text' placeholder="Nhập họ và tên của bạn" />
                </Form.Item>
                <Form.Item
                    label='Email'
                    name="email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không đúng định dạng!' }
                    ]}
                >
                    <Input type='email' placeholder="Nhập email của bạn" />
                </Form.Item>
                <Form.Item
                    label='Số điện thoại'
                    name="phone"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại!' }
                    ]}
                >
                    <Input type='text' placeholder="Nhập số điện thoại của bạn" />
                </Form.Item>
                <Form.Item
                    label='Mật khẩu'
                    name="password"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu!' }
                    ]}
                >
                    <Input type='password' placeholder="Nhập mật khẩu của bạn" />
                </Form.Item>
                <Link to="/login" className='m-2'>Đã có tài khoản? Đăng nhập tại đây</Link>
                <Button type='primary' htmlType="submit">Đăng Ký</Button>
            </Form>
        </div>
    )
}

export default Register