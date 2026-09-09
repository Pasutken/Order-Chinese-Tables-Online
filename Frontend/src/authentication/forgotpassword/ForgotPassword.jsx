import './ForgotPassword.css'; 
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

function ForgotPassword() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [mockOtp, setMockOtp] = useState('');
  const navigate = useNavigate();

  const generateMockOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone) {
      setError('กรุณากรอกเบอร์โทรศัพท์');
      setSuccess('');
      return;
    }
    setError('');
    axios.post("http://localhost:3000/api/ForgotPassword" ,{
      phone: phone
    })
    .then((res) => {
      console.log("ส่งเบอร์โทร",res.data)
      const generatedOtp = generateMockOtp();
      setMockOtp(generatedOtp);
      setSuccess('ส่ง OTP ไปยังเบอร์โทรศัพท์แล้ว');
      setShowOtpModal(true);
      setOtp('');
      setOtpError('');
      alert('Mock OTP: ' + generatedOtp);
    }).catch((err) => {
      console.log(err)
      setSuccess('');
      return setError('เบอร์โทรศัพท์ไม่ถูกต้อง');
    })
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!otp) {
      setOtpError('กรุณากรอก OTP');
      return;
    }
    setOtpError('');
    
    // ตรวจสอบ OTP ที่สุ่มมา
    if (otp === mockOtp) {
      setOtpSuccess('ยืนยัน OTP สำเร็จ');
      console.log("ยืนยัน OTP สำเร็จ");
      setTimeout(() => {
        navigate('/resetpassword', { state: { phone } });
      }, 1000);
    } else {
      setOtpError('OTP ไม่ถูกต้อง');
    }
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtp('');
    setOtpError('');
    setOtpSuccess('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>ลืมรหัสผ่าน</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>เบอร์โทรศัพท์</label>
            <input
              type="text"
              placeholder="เบอร์โทรศัพท์"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {error && <p className="error-message">{error}</p>}
          {success && <p style={{ color: 'green', textAlign: 'center', marginTop: '10px' }}>{success}</p>}

          <button type="submit" className="btn-login">ยืนยัน</button>
          
        </form>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeOtpModal}>×</button>
            <h2>ยืนยัน OTP</h2>
            <p>กรุณากรอก OTP ที่ส่งไปยัง {phone}</p>

            <form onSubmit={handleOtpSubmit}>
              <div className="form-group">
                <label>รหัส OTP</label>
                <input
                  type="text"
                  placeholder="กรอก OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                />
              </div>

              {otpError && <p className="error-message">{otpError}</p>}
              {otpSuccess && <p style={{ color: 'green', textAlign: 'center', marginTop: '10px' }}>{otpSuccess}</p>}

              <button type="submit" className="btn-login">ยืนยัน OTP</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;