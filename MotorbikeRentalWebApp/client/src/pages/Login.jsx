import React from 'react'
import { Button, Form, Input, message } from 'antd'
import '../styles/RegisterStyles.css'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { showLoading, hideLoading } from '../redux/features/alertSlice'
import axios from 'axios'

const Login = () => {
    const navigate = useNavigate()
    // const location = useLocation()
    const dispatch = useDispatch()

    const onFinishHandler = async (values) => {
        try {
            dispatch(showLoading())
            const res = await axios.post('http://localhost:8080/api/v1/user/login', values)
            dispatch(hideLoading())
            if (res.data.success) {
                localStorage.setItem("token", res.data.token)
                localStorage.setItem("user", JSON.stringify(res.data.user))
                message.success('Đăng nhập thành công')
                // Get redirect path from query string
                // const params = new URLSearchParams(location.search);
                const role = res.data.user.role.name;
                console.log('>>>>>>>>>', role)
                if (role === 'admin') {
                    navigate('/admin', { replace: true });
                } else if (role === 'employee') {
                    navigate('/employee', { replace: true });
                } else if (role === 'customer') {
                    navigate('/', { replace: true });
                } else {
                    navigate('/unauthorized', { replace: true }); // fallback nếu cần
                }
                // const redirectPath = params.get('redirect') || '/';
                // navigate(redirectPath, { replace: true });
            }
            else {
                message.error(res.data.message)
            }
        } catch (error) {
            dispatch(hideLoading())
            console.log(error)
            message.error('Đã xảy ra lỗi')
        }
    }
    return (
        <div className="form-container">
            <Form layout='vertical' onFinish={onFinishHandler} className="register-form">
                <h3 className='text-center'>Đăng Nhập</h3>
                <Form.Item label='Email' name="email">
                    <Input type='email' required placeholder="Nhập email của bạn" />
                </Form.Item>
                <Form.Item label='Mật khẩu' name="password">
                    <Input type='password' required placeholder="Nhập mật khẩu của bạn" />
                </Form.Item>
                <Link to="/register" className='m-2'>Chưa có tài khoản? Đăng ký tại đây</Link>
                <Button type='primary' htmlType="submit">Đăng Nhập</Button>
            </Form>
        </div>
    )
}

export default Login