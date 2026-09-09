import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // (แก้ path ให้ถูก)

function AdminRoute({ children }) {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated && role === 'admin') {
    return children; // (ผ่าน!)
  }
  
  if (isAuthenticated) {
     return <Navigate to="/" replace />; // (Login แล้ว แต่ไม่ใช่ Admin -> ส่งไปหน้าหลัก)
  }

  return <Navigate to="/login" replace />; // (ยังไม่ Login)
}
export default AdminRoute;