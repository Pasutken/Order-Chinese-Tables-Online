import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * GuestRoute (Public-Only Route)
 */
const GuestRoute = ({ children }) => {
  const { auth } = useAuth();

  // --- [ส่วนที่เพิ่ม] ป้องกันหน้าขาว ---
  // ถ้า Context ยังไม่พร้อม (auth เป็น null/undefined) ให้หยุดรอ (return null)
  if (!auth) {
    return null; // หรือใส่ <div className="loading">Loading...</div>
  }

  // ถ้า Login อยู่แล้ว -> ดีดออกไปหน้าอื่น
  if (auth.isAuthenticated) {
    const role = auth.user?.role;

    if (role === 'admin') {
      return <Navigate to="/menu" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // ถ้ายังไม่ Login -> ให้เข้าได้ปกติ
  return children;
};

export default GuestRoute;