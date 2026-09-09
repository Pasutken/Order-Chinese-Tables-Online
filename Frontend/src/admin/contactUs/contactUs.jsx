import { useEffect, useState } from 'react';
import './contactUs.css'; // (เราจะสร้าง CSS นี้ในขั้นตอนถัดไป)
import axios from 'axios';

// (ฟังก์ชันช่วยแปลง Date ให้อ่านง่าย)
function formatDateTime(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ContactUs({ url }) { // (ใช้ url prop เหมือนเดิม)

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // (ฟังก์ชันสำหรับดึงข้อมูล)
  const fetchMessages = () => {
    setLoading(true);
    axios.get(`${url}/api/contact/messages`) // (GET API ที่เราจะสร้าง)
      .then(res => {
        setMessages(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError("ไม่สามารถโหลดข้อความได้: " + err.message);
        setLoading(false);
      });
  };

  // (ดึงข้อมูลครั้งแรกเมื่อเปิดหน้า)
  useEffect(() => {
    fetchMessages();
  }, [url]);

  // (ฟังก์ชัน "มาร์คว่าอ่านแล้ว")
  const handleMarkAsRead = (id) => {
    axios.put(`${url}/api/contact/message/${id}/read`) // (PUT API ที่เราจะสร้าง)
      .then(res => {
        // อัปเดต State โดยเปลี่ยน 'isRead' ของข้อความนั้น
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === id ? { ...msg, isRead: true } : msg
          )
        );
      })
      .catch(err => alert("เกิดข้อผิดพลาดในการอัปเดต"));
  };

  // (ฟังก์ชัน "ลบข้อความ")
  const handleDelete = (id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อความนี้?")) return;

    axios.delete(`${url}/api/contact/message/${id}`) // (DELETE API ที่เราจะสร้าง)
      .then(() => {
        // ลบข้อความนั้นออกจาก State
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg._id !== id)
        );
      })
      .catch(err => alert("เกิดข้อผิดพลาดในการลบ"));
  };

  // (แสดงผล Loading หรือ Error)
  if (loading) return <div className="contact-admin-container"><h2>กำลังโหลด...</h2></div>;
  if (error) return <div className="contact-admin-container"><h2>{error}</h2></div>;

  return (
    <div className="contact-admin-container">
      <h1>ข้อความติดต่อจากลูกค้า</h1>
      
      <div className="message-list">
        {messages.length === 0 ? (
          <p className="no-messages">ยังไม่มีข้อความ</p>
        ) : (
          messages.map(msg => (
            // (เพิ่ม class 'is-read' ถ้าอ่านแล้ว)
            <div key={msg._id} className={`message-card ${msg.isRead ? 'is-read' : ''}`}>
              
              <div className="message-header">
                <div className="sender-info">
                  <strong>{msg.name}</strong>
                  <span>({msg.emailOrPhone})</span>
                </div>
                <span className="message-date">{formatDateTime(msg.createdAt)}</span>
              </div>
              
              <div className="message-body">
                <p>{msg.message}</p>
              </div>
              
              <div className="message-footer">
                {/* (ถ้ายังไม่อ่าน ให้โชว์ปุ่ม "มาร์คว่าอ่านแล้ว") */}
                {!msg.isRead && (
                  <button 
                    className="btn-mark-read"
                    onClick={() => handleMarkAsRead(msg._id)}
                  >
                    <i className="bi bi-check-circle"></i> มาร์คว่าอ่านแล้ว
                  </button>
                )}
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(msg._id)}
                >
                  <i className="bi bi-trash"></i> ลบ
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ContactUs;