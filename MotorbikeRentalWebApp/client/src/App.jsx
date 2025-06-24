// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import AdminPage from './pages/admin/AdminPage'
import AccountPage from './pages/admin/account/AccountPage'
import BranchPage from './pages/admin/branches/BranchPage'
import FeedBackPage from './pages/admin/feedback/FeedBackPage'
import CreateAccountPage from './pages/admin/account/CreateAccountPage'
import DeleteAccountPage from './pages/admin/account/DeleteAccountPage'
import UpdateAccountPage from './pages/admin/account/UpdateAccountPage'
import CreateBranchPage from './pages/admin/branches/CreateBranchPage'
import UpdateBranchPage from './pages/admin/branches/UpdateBranchPage'
import DeleteBrachPage from './pages/admin/branches/DeleteBrachPage'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          {/* ====admin==== */}
          <Route path='/admin' element={<AdminPage />} />
          {/* ====admin-account==== */}
          <Route path='/admin/account' element={<AccountPage />} />
          <Route path='/admin/account/create' element={<CreateAccountPage />} />
          <Route path='/admin/account/delete/:id' element={<DeleteAccountPage />} />
          <Route path='/admin/account/update/:id' element={<UpdateAccountPage />} />
          {/* ====admin-branch==== */}
          <Route path='/admin/branch' element={<BranchPage />} />
          <Route path='/admin/branch/create' element={<CreateBranchPage />} />
          <Route path='/admin/branch/update/:id' element={<UpdateBranchPage />} />
          <Route path='/admin/branch/delete/:id' element={<DeleteBrachPage />} />
          {/* ====admin-feedback==== */}
          <Route path='/admin/feedback' element={<FeedBackPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
