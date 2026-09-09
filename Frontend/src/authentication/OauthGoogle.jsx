// ในไฟล์ /src/pages/AuthSuccess.js (ตัวอย่าง)
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. อ่าน token จาก URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      // 2. บันทึก token ลง localStorage
      localStorage.setItem('token', token);
      
      // 3. ไปหน้าหลัก (หรือหน้า dashboard)
      navigate('/'); 
    } else {
      // ไม่มี token, กลับไปหน้า login
      navigate('/login');
    }
  }, [location, navigate]);

  return <div>กำลังตรวจสอบการยืนยันตัวตน...</div>;
};

export default AuthSuccess;