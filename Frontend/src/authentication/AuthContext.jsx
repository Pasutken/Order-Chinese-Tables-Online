// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

// 1. สร้าง Context
const AuthContext = createContext(null);

// 2. สร้าง "Provider" (ตัวห่อหุ้มแอป)
export function AuthProvider({ children }) {
  // (อ่านค่าเริ่มต้นจาก localStorage)
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  console.log("isAuthenticated",isAuthenticated)
  // 3. ฟังก์ชัน Login (ให้หน้า Login เรียกใช้)
  // (รับ token และ role ที่ได้จาก API)
  const login = (newToken, newRole) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    setToken(newToken);
    setRole(newRole);
    setIsAuthenticated(true);
  };

  // 4. ฟังก์ชัน Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  // 5. ส่งค่าทั้งหมดนี้ให้ "ลูกๆ"
  const value = { token, role, isAuthenticated, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 6. สร้าง Hook (ทางลัด)
export const useAuth = () => {
  return useContext(AuthContext);
};