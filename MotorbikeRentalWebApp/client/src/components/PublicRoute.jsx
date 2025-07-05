import React from 'react'
import { Navigate } from 'react-router-dom'

export default function PublicRoute({ children }) {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
        return <Navigate to='/' />
    }
    else {
        return children
    }
}
