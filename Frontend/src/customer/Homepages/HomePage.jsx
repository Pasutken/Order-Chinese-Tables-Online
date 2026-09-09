import {  useNavigate } from 'react-router-dom';
import './HomePage.css';
import { FiAward, FiUsers, FiTruck } from 'react-icons/fi';

const HomePage = () => {
  const navigate = useNavigate();

  const FALLBACK_MENU_ID = '69008342822c4673fd496f1c';

  // ฟังก์ชันนี้จะทำงานเมื่อกดปุ่ม "ดูเมนูและแพ็คเกจ"
  const handleViewMenuClick = () => {
    // นำทางไปยังหน้า MenuSelection ด้วย ID เมนูเริ่มต้นที่กำหนดไว้
    navigate(`/menu/${FALLBACK_MENU_ID}`);
  };

  return (
    <div className="home-container">
      {/* === Hero Section (ส่วนบนสุด) === */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>บริการโต๊ะจีน จัดเลี้ยงคุณภาพ</h1>
          <p>อร่อย สะอาด บริการประทับใจ ด้วยประสบการณ์ยาวนานกว่า 20 ปี</p>

          {/* ปุ่มที่ใช้ onClick เพื่อนำทาง
          <button
            onClick={handleViewMenuClick}
            className="cta-button" // <-- ใช้ className เดิมเพื่อให้เป็นสีสวย
            type="button" // <-- ใส่ type="button" เพื่อให้ถูกต้องตามหลัก HTML
          >
            ดูเมนูและแพ็คเกจ
          </button> */}
        </div>
      </div>

      {/* --- Features Section (จุดเด่น) --- */}
      <div className="features-section">
        <h2>ทำไมต้องเลือกเรา</h2>
        <div className="features-grid">
          <div className="feature-item">
            <FiAward size={40} />
            <h3>คุณภาพวัตถุดิบ</h3>
            <p>เราคัดสรรแต่วัตถุดิบที่สดใหม่ สะอาด ปลอดภัย</p>
          </div>
          <div className="feature-item">
            <FiUsers size={40} />
            <h3>ทีมงานมืออาชีพ</h3>
            <p>บริการจัดเลี้ยงโดยทีมงานมากประสบการณ์ พร้อมดูแลคุณ</p>
          </div>
          <div className="feature-item">
            <FiTruck size={40} />
            <h3>บริการทั่วพื้นที่</h3>
            <p>ให้บริการจัดเลี้ยงนอกสถานที่ ครอบคลุมพื้นที่ [ระบุพื้นที่]</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;