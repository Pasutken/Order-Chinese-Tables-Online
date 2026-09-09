import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
function CustomerRoute({ children }) {
  const { isAuthenticated, role } = useAuth();

  // (ถ้าเป็น Admin, ส่งไปหน้า Admin)
  if (isAuthenticated && role === 'admin') {
    return <Navigate to="/menu" replace />;
  }

  // (ถ้า Login (และไม่ใช่ Admin) -> ผ่าน!)
  if (isAuthenticated) {
    return children;
  }
  
  // (ยังไม่ Login)
  return <Navigate to="/login" replace />;
}
export default CustomerRoute;