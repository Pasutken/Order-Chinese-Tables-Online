import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom'; 
import './Payment.css'; 

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { bookingId, totalPrice, username } = location.state || {};

  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // คำนวณยอดมัดจำ 30%
  const depositAmount = useMemo(() => {
    if (!totalPrice) return 0;
    return totalPrice * 0.30;
  }, [totalPrice]);

  // Guard: ป้องกันการรีเฟรช / เข้าตรง
  useEffect(() => {
    if (!bookingId) {
      alert("ไม่พบข้อมูลการชำระเงิน กรุณาเริ่มต้นใหม่ครับ");
      navigate("/");
    }
  }, [bookingId, navigate]);

  // Handle File Change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle Submit Payment
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('กรุณาอัปโหลดสลิปการโอนเงิน');
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('bookingId', bookingId);
    formData.append('slip', selectedFile); 

    try {
      const response = await fetch('http://localhost:3000/api/payment-confirmation', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'อัปโหลดสลิปไม่สำเร็จ');
      }

      alert('อัปโหลดสลิปเรียบร้อย! การจองของคุณได้รับการยืนยันแล้ว');
      navigate('/'); 

    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error);
      alert(error.message);
      setIsSubmitting(false);
    }
  };

  // หน้า Loading/Checking
  if (!bookingId) {
    return (
      <div style={{ textAlign: "center", marginTop: "40px", fontFamily: "Kanit" }}>
        กำลังตรวจสอบข้อมูลการชำระเงิน...
      </div>
    );
  }

  return (
    <div className="payment-container">
      <h1>ชำระเงินค่ามัดจำ (30%)</h1>
      <p className="payment-intro">
        สวัสดีคุณ {username}, กรุณาชำระยอดมัดจำ 30%
      </p>

      {/* ยอดมัดจำ */}
      <div className="total-price-display">
        {depositAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        <span>บาท</span>
      </div>
      {/* ยอดเต็ม */}
      <p className="full-price-info">
        (จากยอดรวมทั้งหมด { (totalPrice || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) } บาท)
      </p>


      <div className="payment-details">
        {/* QR Code */}
        <div className="payment-method qr-code">
          <h3>สแกน QR Code (PromptPay)</h3>
          <img 
            src="/images/qr.png" // (ต้องใส่รูป QR ของคุณ)
            alt="QR Code" 
            className="qr-image"
          />
          <p>ชื่อบัญชี: [ชื่อบัญชีของคุณ]</p>
        </div>

        {/* Bank Transfer */}
        <div className="payment-method bank-transfer">
          <h3>หรือ โอนผ่านบัญชีธนาคาร</h3>
          <div className="bank-info">
            <p><strong>ธนาคาร:</strong> [ชื่อธนาคาร]</p>
            <p><strong>เลขที่บัญชี:</strong> [123-4-56789-0]</p>
            <p><strong>ชื่อบัญชี:</strong> [ชื่อบัญชีของคุณ]</p>
          </div>
        </div>
      </div>

      {/* ฟอร์มอัปโหลดสลิป */}
      <form className="slip-upload-form" onSubmit={handleSubmitPayment}>
        <h2>ยืนยันการชำระเงิน</h2>
        <p>หลังจากชำระเงินแล้ว กรุณาอัปโหลดสลิปเพื่อยืนยัน</p>
        
        <label htmlFor="slipFile" className="file-label">
          {selectedFile ? `เลือกไฟล์แล้ว: ${selectedFile.name}` : 'เลือกไฟล์สลิป'}
        </label>
        <input 
          type="file" 
          id="slipFile"
          className="file-input"
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/jpg"
          required
        />
        
        <button 
          type="submit" 
          className="confirm-payment-btn"
          disabled={!selectedFile || isSubmitting}
        >
          {isSubmitting ? 'กำลังอัปโหลด...' : 'ยืนยันการชำระเงิน'}
        </button>
      </form>

      <div className="payment-footer-actions">
        <Link to="/" className="pay-later-link">
          ชำระเงินภายหลัง (กลับไปหน้าแรก)
        </Link>
      </div>
      
    </div>
  );
};

export default Payment;