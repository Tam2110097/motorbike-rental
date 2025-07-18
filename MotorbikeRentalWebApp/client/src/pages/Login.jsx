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
                message.success('Login Successfully')
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
            message.error('Something Went Wrong')
        }
    }
    return (
        <div className="form-container">
            <Form layout='vertical' onFinish={onFinishHandler} className="register-form">
                <h3 className='text-center'>Login Form</h3>
                <Form.Item label='Email' name="email">
                    <Input type='email' required />
                </Form.Item>
                <Form.Item label='Password' name="password">
                    <Input type='password' required />
                </Form.Item>
                <Link to="/register" className='m-2'>Not a user register here</Link>
                <Button type='primary' htmlType="submit">Login</Button>
            </Form>
        </div>
    )
}

export default Login