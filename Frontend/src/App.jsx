import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// --- Import Admin Pages ---
import Menu from "./admin/sidebarMenu/menu.jsx";
import MpEditPackage from "./admin/manageProducts/mpEditPackage/mpEditPackage.jsx";
import MpAddPackage from "./admin/manageProducts/mpAddPackage/mpAddPackage.jsx";
import MpMenu from "./admin/manageProducts/mpMenu/mpMenu.jsx";
import ManageProduct from "./admin/manageProducts/mpMain/manageProducts.jsx";

// --- Import Auth Pages ---
import Login from "./authentication/login/Login.jsx";
import Register from "./authentication/register/Register.jsx";
import ForgotPassword from "./authentication/forgotpassword/ForgotPassword.jsx";
import ResetPassword from "./authentication/resetpassword/Resetpassword.jsx";
import AuthSuccess from "./authentication/OauthGoogle.jsx";

// --- Import Customer Pages ---
import MainLayout from "./customer/layouts/MainLayout";
import HomePage from "./customer/Homepages/HomePage";
import MenuSelection from "./customer/Menu/MenuSelection.jsx";
import Form from "./customer/Form/Form";
import BookingSummary from "./customer/Summary/BookingSummary";
import Payment from "./customer/Payment/Payment";
import UserProfile from "./customer/Userprofile/UserProfile";
import BookingStatusPage from "./customer/Bookingstatuspage/BookingStatusPage";
import AboutUs from "./customer/Aboutus/AboutUs";
import ContactUs from "./customer/Contactus/ContactUs";

// --- Import Context & Routes ---
import { AuthProvider } from "./authentication/AuthContext.jsx";
import AdminRoute from "./authentication/AdminRoute.jsx";
import CustomerRoute from "./authentication/CustomerRoute.jsx";
import GuestRoute from "./authentication/GuestRoute.jsx";

function App() {
  const url = "http://localhost:3000";

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* =====================================================
              ZONE 1: Guest Only (คนล็อกอินแล้ว ห้ามเข้า)
             ===================================================== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/resetpassword" element={<ResetPassword  />} />

          {/* OAuth Callback (มักจะเป็น Public เพื่อรอรับ Token) */}
          <Route path="/auth-success" element={<AuthSuccess />} />

          {/* =====================================================
              ZONE 2: Customer Application (Main Layout)
             ===================================================== */}
          <Route path="/" element={<MainLayout />}>
            {/* 2.1 Public Pages (ใครก็เข้าได้ ไม่ต้อง Login) */}
            <Route index element={<HomePage />} />
            <Route path="/menu/:packageId" element={<MenuSelection />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />

            {/* 2.2 Protected Pages (ต้อง Login เป็น Customer เท่านั้น) */}

            <Route
              path="/booking"
              element={
                <CustomerRoute>
                  <Form />
                </CustomerRoute>
              }
            />
            <Route
              path="/summary"
              element={
                <CustomerRoute>
                  <BookingSummary />
                </CustomerRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <CustomerRoute>
                  <Payment />
                </CustomerRoute>
              }
            />
          </Route>

          {/* =====================================================
              ZONE 3: Customer Standalone (ไม่มี Navbar/Sidebar ปกติ)
             ===================================================== */}
          <Route
            path="/profile"
            element={
              <CustomerRoute>
                <UserProfile />
              </CustomerRoute>
            }
          />
          <Route
            path="/booking-status"
            element={
              <CustomerRoute>
                <BookingStatusPage />
              </CustomerRoute>
            }
          />

          {/* =====================================================
              ZONE 4: Admin Dashboard (ต้องเป็น Admin เท่านั้น)
             ===================================================== */}
          <Route
            path="/menu"
            element={
              <AdminRoute>
                <Menu url={url} />
              </AdminRoute>
            }
          />
          <Route
            path="/mpmenu"
            element={
              <AdminRoute>
                <MpMenu url={url} />
              </AdminRoute>
            }
          />
          <Route
            path="/mpeditpackage/:packageId"
            element={
              <AdminRoute>
                <MpEditPackage url={url} />
              </AdminRoute>
            }
          />
          <Route
            path="/mpaddpackage"
            element={
              <AdminRoute>
                <MpAddPackage url={url} />
              </AdminRoute>
            }
          />
          <Route
            path="/manageproduct"
            element={
              <AdminRoute>
                <ManageProduct url={url} />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
