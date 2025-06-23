import React from 'react'
import { Button, Form, Input, message } from 'antd'
import '../styles/RegisterStyles.css'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { showLoading, hideLoading } from '../redux/features/alertSlice'
import axios from 'axios'

const Login = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const onFinishHandler = async (values) => {
        try {
            dispatch(showLoading())
            const res = await axios.post('http://localhost:8080/api/v1/user/login', values)
            dispatch(hideLoading())
            if (res.data.success) {
                localStorage.setItem("token", res.data.token)
                message.success('Login Successfully')
                navigate('/');
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