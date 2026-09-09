import { useState } from 'react';
import './ContactUs.css';
import { FiPhone, FiMail, FiMapPin, FiSend } from 'react-icons/fi';

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: '', emailOrPhone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const response = await fetch('http://localhost:3000/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'ส่งข้อความไม่สำเร็จ');
      
      setSubmitStatus('success');
      setFormData({ name: '', emailOrPhone: '', message: '' });
      alert("ส่งข้อความเรียบร้อยแล้ว!");
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      setSubmitStatus('error');
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="contact-wrapper">

        {/* หัวข้อหลัก */}
        <div className="contact-header-v3">
          <h1>ติดต่อเรา</h1>
          <p className="header-subtitle">สนใจบริการโต๊ะจีนระดับพรีเมี่ยม หรือต้องการสอบถามข้อมูลเพิ่มเติม?</p>
        </div>

        {/* 2 คอลัมน์หลัก: ข้อมูล + ฟอร์ม */}
        <div className="contact-main-grid">

          {/* ซ้าย: ข้อมูลติดต่อ */}
          <div className="contact-info-side">
            <h2>ช่องทางการติดต่อ</h2>
            <div className="info-list">
              <div className="info-item">
                <FiPhone className="icon" />
                <div>
                  <h4>โทรศัพท์</h4>
                  <p>081-234-5678</p>
                  <a href="tel:0812345678">โทรเลยตอนนี้ →</a>
                </div>
              </div>
              <div className="info-item">
                <FiMail className="icon" />
                <div>
                  <h4>อีเมล</h4>
                  <p>contact@โต๊ะจีนพรีเมี่ยม.com</p>
                  <a href="mailto:contact@โต๊ะจีนพรีเมี่ยม.com">ส่งอีเมลหาเรา</a>
                </div>
              </div>
              <div className="info-item">
                <FiMapPin className="icon" />
                <div>
                  <h4>ที่ตั้งร้าน</h4>
                  <p>123/45 ซอยสุขุมวิท 21<br />แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110</p>
                  <a href="#map" className="scroll-link">ดูแผนที่ใหญ่ →</a>
                </div>
              </div>
            </div>

            {/* เวลาทำการ */}
            <div className="business-hours">
              <h4>🕒 เวลาทำการ</h4>
              <p>ทุกวัน: 09:00 - 21:00 น.</p>
              <p className="highlight">จันทร์ - ศุกร์: ตอบกลับภายใน 1 ชม.</p>
            </div>
          </div>

          {/* ขวา: ฟอร์ม */}
          <div className="contact-form-side-v3">
            <div className="form-card">
              <h2>ส่งข้อความถึงเรา</h2>
              <p>กรอกข้อมูลด้านล่าง ทีมงานจะติดต่อกลับอย่างรวดเร็ว ⚡</p>
              <br />

              <form onSubmit={handleSubmit}>
                <div className="form-row-v2">
                  <div className="form-group">
                    <label>ชื่อ-นามสกุล *</label>
                    <input 
                      type="text" 
                      id="name" 
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="สมชาย ใจดี"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>อีเมลหรือเบอร์โทร *</label>
                    <input 
                      type="text" 
                      id="emailOrPhone" 
                      value={formData.emailOrPhone}
                      onChange={handleInputChange}
                      placeholder="example@email.com หรือ 081-xxx-xxxx"
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>ข้อความของคุณ *</label>
                  <textarea 
                    id="message" 
                    rows="6" 
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="สนใจจัดเลี้ยง 50 โต๊ะ วันที่ 15 ธ.ค. นี้ ต้องการเมนูแนะนำ..."
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn-v3"
                  disabled={isSubmitting}
                >
                  <FiSend style={{ marginRight: 8 }} />
                  {isSubmitting ? 'กำลังส่ง...' : 'ส่งข้อความทันที'}
                </button>

                {submitStatus === 'success' && 
                  <p className="status-success">✅ ส่งสำเร็จ! เราจะติดต่อกลับภายใน 1 ชั่วโมง</p>
                }
                {submitStatus === 'error' && 
                  <p className="status-error">เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง</p>
                }
              </form>
            </div>
          </div>
        </div>

        {/* แผนที่ */}
        <div id="map" className="map-section-v3">
          <h2>เราอยู่ที่นี่ 📍</h2>
          <div className="map-container-v3">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.565433292728!2d100.5610198148303!3d13.74415530121706!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29eef2713f83f%3A0x10693a457630bcd6!2sTerminal%2021%20Asok!5e0!3m2!1sth!2sth!4v1678888888888!5m2!1sth!2sth" 
              width="100%" 
              height="450" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactUs;