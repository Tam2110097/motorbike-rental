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
import EmployeePage from './pages/employee/EmployeePage'
import AccessoryPage from './pages/employee/accessory/AccessoryPage'
import CreateAccessoryPage from './pages/employee/accessory/CreateAccessoryPage'
import UpdateAccessoryPage from './pages/employee/accessory/UpdateAccessoryPage'
import DeleteAccessoryPage from './pages/employee/accessory/DeleteAccessoryPage'
import MotorbikeTypePage from './pages/admin/motorbike-type/MotorbikeTypePage'
import CreateMotorbikeTypePage from './pages/admin/motorbike-type/CreateMotorbikeTypePage'
import UpdateMotorbikeTypePage from './pages/admin/motorbike-type/UpdateMotorbikeTypePage'
import DeleteMotorbikeTypePage from './pages/admin/motorbike-type/DeleteMotorbikeTypePage'
import PricingRulePage from './pages/admin/pricing-rule/PricingRulePage'
import CreatePricingRulePage from './pages/admin/pricing-rule/CreatePricingRulePage'
import UpdatePricingRulePage from './pages/admin/pricing-rule/UpdatePricingRulePage'
import DeletePricingRulePage from './pages/admin/pricing-rule/DeletePricingRulePage'
import SpecificationPage from './pages/admin/specification/SpecificationPage'
import CreateSpecificationPage from './pages/admin/specification/CreateSpecificationPage'
import UpdateSpecificationPage from './pages/admin/specification/UpdateSpecificationPage'
import DeleteSpecificationPage from './pages/admin/specification/DeleteSpecificationPage'
import MotorbikePage from './pages/employee/motorbike/MotorbikePage'
import CreateMotorbikePage from './pages/employee/motorbike/CreateMotorbikePage'
import UpdateMotorbikePage from './pages/employee/motorbike/UpdateMotorbikePage'
import DeleteMotorbikePage from './pages/employee/motorbike/DeleteMotorbikePage'
import AvailableMotorbikePage from './pages/customer/booking/AvailableMotorbikePage'
import MotorbikeDetailPage from './pages/customer/booking/MotorbikeDetailPage'

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
          {/* ====admin-motorbike-type==== */}
          <Route path='/admin/motorbike-type' element={<MotorbikeTypePage />} />
          <Route path='/admin/motorbike-type/create' element={<CreateMotorbikeTypePage />} />
          <Route path='/admin/motorbike-type/update/:id' element={<UpdateMotorbikeTypePage />} />
          <Route path='/admin/motorbike-type/delete/:id' element={<DeleteMotorbikeTypePage />} />
          {/* ====admin-pricing-rule==== */}
          <Route path='/admin/pricing-rule' element={<PricingRulePage />} />
          <Route path='/admin/pricing-rule/create' element={<CreatePricingRulePage />} />
          <Route path='/admin/pricing-rule/update/:id' element={<UpdatePricingRulePage />} />
          <Route path='/admin/pricing-rule/delete/:id' element={<DeletePricingRulePage />} />
          {/* ====admin-specification==== */}
          <Route path='/admin/specification' element={<SpecificationPage />} />
          <Route path='/admin/specification/create' element={<CreateSpecificationPage />} />
          <Route path='/admin/specification/update/:id' element={<UpdateSpecificationPage />} />
          <Route path='/admin/specification/delete/:id' element={<DeleteSpecificationPage />} />
          {/* ====admin-feedback==== */}
          <Route path='/admin/feedback' element={<FeedBackPage />} />
          {/* ====employee==== */}
          <Route path='/employee' element={<EmployeePage />} />
          {/* ====employee-accessory==== */}
          <Route path='/employee/accessory' element={<AccessoryPage />} />
          <Route path='/employee/accessory/create' element={<CreateAccessoryPage />} />
          <Route path='/employee/accessory/update/:id' element={<UpdateAccessoryPage />} />
          <Route path='/employee/accessory/delete/:id' element={<DeleteAccessoryPage />} />
          {/* ====employee-motorbike==== */}
          <Route path='/employee/motorbike' element={<MotorbikePage />} />
          <Route path='/employee/motorbike/create' element={<CreateMotorbikePage />} />
          <Route path='/employee/motorbike/update/:id' element={<UpdateMotorbikePage />} />
          <Route path='/employee/motorbike/delete/:id' element={<DeleteMotorbikePage />} />
          {/* ====customer==== */}
          <Route path='/booking/available-motorbike' element={<AvailableMotorbikePage />} />
          <Route path='/motorbike-detail/:id' element={<MotorbikeDetailPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
