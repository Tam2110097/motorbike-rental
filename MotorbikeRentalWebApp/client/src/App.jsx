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
import { BookingProvider } from './context/BookingContext'
import ConfirmBikeModel from './pages/customer/booking/confirm/ConfirmBikeModel'
import OrderReviewPage from './pages/customer/booking/order-review/OrderReviewPage'
import CheckoutPage from './pages/customer/booking/checkout/CheckoutPage'
import MyOrderPage from './pages/customer/order/MyOrderPage'
import NotAllowed from './pages/NotAllowed';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path='/'
            element={
              <BookingProvider>
                <HomePage />
              </BookingProvider>
            } />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          {/* ====admin==== */}
          <Route path='/admin' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPage />
            </ProtectedRoute>
          } />
          {/* ====admin-account==== */}
          <Route path='/admin/account' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AccountPage />
            </ProtectedRoute>
          } />
          <Route path='/admin/account/create' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreateAccountPage />
            </ProtectedRoute>
          } />
          <Route path='/admin/account/delete/:id' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DeleteAccountPage />
            </ProtectedRoute>
          } />
          <Route path='/admin/account/update/:id' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UpdateAccountPage />
            </ProtectedRoute>
          } />
          {/* ====admin-branch==== */}
          <Route path='/admin/branch' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <BranchPage />
            </ProtectedRoute>
          } />
          <Route path='/admin/branch/create' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreateBranchPage />
            </ProtectedRoute>
          } />
          <Route path='/admin/branch/update/:id' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UpdateBranchPage />
            </ProtectedRoute>
          } />
          <Route path='/admin/branch/delete/:id' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DeleteBrachPage />
            </ProtectedRoute>
          } />
          {/* ====admin-motorbike-type==== */}
          <Route path='/admin/motorbike-type' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <MotorbikeTypePage />
            </ProtectedRoute>
          } />
          <Route path='/admin/motorbike-type/create' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreateMotorbikeTypePage />
            </ProtectedRoute>
          } />
          <Route path='/admin/motorbike-type/update/:id' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UpdateMotorbikeTypePage />
            </ProtectedRoute>
          } />
          <Route path='/admin/motorbike-type/delete/:id' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DeleteMotorbikeTypePage />
            </ProtectedRoute>
          } />
          {/* ====admin-pricing-rule==== */}
          <Route path='/admin/pricing-rule' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PricingRulePage />
            </ProtectedRoute>
          } />
          <Route path='/admin/pricing-rule/create' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreatePricingRulePage />
            </ProtectedRoute>
          } />
          <Route path='/admin/pricing-rule/update/:id' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UpdatePricingRulePage />
            </ProtectedRoute>
          } />
          <Route path='/admin/pricing-rule/delete/:id' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DeletePricingRulePage />
            </ProtectedRoute>
          } />
          {/* ====admin-specification==== */}
          <Route path='/admin/specification' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SpecificationPage />
            </ProtectedRoute>
          } />
          <Route path='/admin/specification/create' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreateSpecificationPage />
            </ProtectedRoute>
          } />
          <Route path='/admin/specification/update/:id' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UpdateSpecificationPage />
            </ProtectedRoute>
          } />
          <Route path='/admin/specification/delete/:id' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DeleteSpecificationPage />
            </ProtectedRoute>
          } />
          {/* ====admin-feedback==== */}
          <Route path='/admin/feedback' element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <FeedBackPage />
            </ProtectedRoute>
          } />
          {/* ====employee==== */}
          <Route path='/employee' element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeePage />
            </ProtectedRoute>
          } />
          {/* ====employee-accessory==== */}
          <Route path='/employee/accessory' element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <AccessoryPage />
            </ProtectedRoute>
          } />
          <Route path='/employee/accessory/create' element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <CreateAccessoryPage />
            </ProtectedRoute>
          } />
          <Route path='/employee/accessory/update/:id' element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <UpdateAccessoryPage />
            </ProtectedRoute>
          } />
          <Route path='/employee/accessory/delete/:id' element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <DeleteAccessoryPage />
            </ProtectedRoute>
          } />
          <Route path='/not-allowed' element={<NotAllowed />} />
          {/* ====employee-motorbike==== */}
          <Route path='/employee/motorbike' element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <MotorbikePage />
            </ProtectedRoute>
          } />
          <Route path='/employee/motorbike/create' element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <CreateMotorbikePage />
            </ProtectedRoute>
          } />
          <Route path='/employee/motorbike/update/:id' element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <UpdateMotorbikePage />
            </ProtectedRoute>
          } />
          <Route path='/employee/motorbike/delete/:id' element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <DeleteMotorbikePage />
            </ProtectedRoute>
          } />
          {/* ====customer==== */}
          <Route
            path='/booking/available-motorbike'
            element={
              <BookingProvider>
                <AvailableMotorbikePage />
              </BookingProvider>
            } />
          <Route path='/motorbike-detail/:id' element={<MotorbikeDetailPage />} />
          <Route
            path='/booking/confirm-bike-model'
            element={
              <BookingProvider>
                <ConfirmBikeModel />
              </BookingProvider>
            } />
          <Route
            path='/booking/order-review'
            element={
              <BookingProvider>
                <OrderReviewPage />
              </BookingProvider>
            } />
          <Route
            path='/booking/checkout'
            element={
              <BookingProvider>
                <CheckoutPage />
              </BookingProvider>
            } />
          <Route path='/order/my-order' element={<MyOrderPage />} />
        </Routes>
      </BrowserRouter >
    </>
  )
}

export default App
