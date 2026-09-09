import './Resetpassword.css'; 
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'

function ResetPassword() {
  const location = useLocation();
  const phone = location.state?.phone || "เบอร์ไม่ระบุ";
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError('กรุณากรอกรหัสผ่านให้ครบทุกช่อง');
      setSuccess('');
      return;
    }
    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      setSuccess('');
      return;
    }

    setError('');

    axios.put('http://localhost:3000/api/ResetPassword',{
      phone: phone,
      newPassword: password
    }).then((res) => {
      console.log(res)
      setSuccess('รีเซ็ตรหัสผ่านสำเร็จ (demo)');
      setTimeout(() => {
      navigate('/login');
    }, 1000); 
    }).catch((err) => {
      console.log(err)
    })

    
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>รีเซ็ตรหัสผ่าน</h2>
        <p>ตั้งรหัสผ่านใหม่สำหรับเบอร์ {phone}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>รหัสผ่านใหม่</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={error && !password ? 'error' : ''}
            />
          </div>

          <div className="form-group">
            <label>ยืนยันรหัสผ่าน</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={error && !confirmPassword ? 'error' : ''}
            />
          </div>

          {error && <p className="error-message">{error}</p>}
          {success && <p style={{ color: 'green', textAlign: 'center', marginTop: '10px' }}>{success}</p>}

          <button type="submit" className="btn-login">ยืนยัน</button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;