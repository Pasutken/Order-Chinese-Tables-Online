import { useState, useEffect, useMemo } from 'react';
import './BookingStatusPage.css'; 
import { 
  FiShoppingBag, 
  FiClock,
  FiEdit,
  FiXCircle,
  FiCheckCircle,
  FiTruck,
  FiCreditCard,
  FiTrash2 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CountdownTimer from './CountdownTimer';

// Helper: แปลงสถานะเป็น UI
const getStatusDetails = (status) => {
  switch (status) {
    case 'pending': return { text: 'รอชำระเงิน', icon: <FiClock />, className: 'pending' };
    case 'in-verification': return { text: 'รอตรวจสอบสลิป', icon: <FiClock />, className: 'pending' };
    case 'Order-Change-Processing': return { text: 'รออนุมัติแก้ไข', icon: <FiEdit />, className: 'edit-pending' };
    case 'confirmed': return { text: 'ยืนยันแล้ว', icon: <FiTruck />, className: 'confirmed' };
    case 'completed': return { text: 'สำเร็จ', icon: <FiCheckCircle />, className: 'completed' };
    case 'cancelled': return { text: 'ยกเลิก', icon: <FiXCircle />, className: 'cancelled' };
    case 'in-progress': return { text: 'กำลังดำเนินการ', icon: <FiTruck />, className: 'confirmed' };
    default: return { text: status || 'สถานะอื่นๆ', icon: <FiShoppingBag />, className: '' };
  }
};

const BookingStatusPage = () => {
  const [activeTab, setActiveTab] = useState('all'); 
  const [dataBookings, setDataBookings] = useState([]); 
  const navigate = useNavigate();

  useEffect(() => {
    getBookings();
  }, []);

  async function getBookings() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:3000/api/checkstatus`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const records = res.data.record || [];
      setDataBookings(records);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setDataBookings([]); 
    }
  }

  // ไปหน้าชำระเงิน
  const handleCardClick = (booking) => {
    if (booking.payment === "unpaid" && booking.status !== 'cancelled') {
        const price = booking.totalPrice || booking.total || 0;
        navigate('/payment', { 
            state: {
              bookingId: booking._id,
              totalPrice: price,
              username: booking.username,
            } 
        });
    }
  };

  // ยกเลิกรายการ
  const handleCancelBooking = async (e, bookingId) => {
    e.stopPropagation();
    if (!window.confirm("คุณต้องการยกเลิกรายการนี้ใช่หรือไม่? การคืนเงินจะเป็นไปตามนโยบายของร้าน")) return;

    try {
        const token = localStorage.getItem("token");
        const res = await axios.put(`http://localhost:3000/api/cancelBooking/${bookingId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        alert(`ยกเลิกรายการเรียบร้อยแล้ว\nเงินที่จะได้รับคืน: ${res.data.refundAmount.toLocaleString()} บาท`);
        getBookings(); 
    } catch (error) {
        console.error(error);
        alert("เกิดข้อผิดพลาดในการยกเลิกรายการ");
    }
  };

  // แก้ไขรายการ
  const handleEditBooking = async (e, bookingId, bookingData) => {
    e.stopPropagation();

    try {
      // 1. ต้องหา packageId เดิมให้เจอก่อน โดยดูจาก "ราคาแพ็กเกจ" (หรือชื่อ)
      const targetPrice = bookingData.details?.packageName;
      
      if (!targetPrice) {
        alert("ไม่พบข้อมูลราคาแพ็กเกจเดิม ไม่สามารถแก้ไขได้");
        return;
      }

      // 2. ดึงรายการแพ็กเกจทั้งหมดมาเทียบหา ID
      const res = await axios.get("http://localhost:3000/api/menus/getpackages");
      const packages = res.data.data || []; 
      console.log(packages)
      // 3. หาแพ็กเกจที่มีราคาตรงกัน
      const matchingPackage = packages.find(pkg => pkg.name === targetPrice);
      
      if (matchingPackage) {
         // 4. ไปหน้า MenuSelection พร้อมส่งข้อมูลเดิม (Pre-fill)
         navigate(`/menu/${matchingPackage._id}`, { 
            state: { 
                isEditing: true,
                existingBooking: bookingData 
            } 
         });
      } else {
         alert("ไม่พบแพ็กเกจที่ตรงกับราคาเดิมในระบบ");
      }

    } catch (error) {
      console.error("Error finding package:", error);
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูลแพ็กเกจ");
    }
  };

  const filteredBookings = useMemo(() => {
    if (!Array.isArray(dataBookings)) return [];

    let filtered = [];
    switch (activeTab) {
      case 'pending': filtered = dataBookings.filter(b => b.status === 'in-progress'); break;
      case 'edit-pending': filtered = dataBookings.filter(b => b.status === 'Order-Change-Processing'); break;
      case 'cancelled': filtered = dataBookings.filter(b => b.status === 'cancelled'); break;
      case 'unpaid': filtered = dataBookings.filter(b => b.payment === "unpaid"); break;
      case 'all': default: filtered = dataBookings;
    }
    return filtered;
  }, [activeTab, dataBookings]);

  return (
    <div className="status-page-container">
      <button className="back-btn" onClick={() => navigate('/profile')}>Back</button>
      <div className="status-page-header">
        <h1>สถานะการจอง</h1>
      </div>
      
      <p>ติดตามสถานะออเดอร์ทั้งหมดของคุณได้ที่นี่</p>
      
      <div className="status-tabs">
        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>ทั้งหมด</button>
        <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>รอดำเนินการ</button>
        <button className={`tab-btn ${activeTab === 'edit-pending' ? 'active' : ''}`} onClick={() => setActiveTab('edit-pending')}>รออนุมัติแก้ไข</button>
        <button className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('cancelled')}>การยกเลิก</button>
        <button className={`tab-btn ${activeTab === 'unpaid' ? 'active' : ''}`} onClick={() => setActiveTab('unpaid')}>รอการชำระเงิน</button>
      </div>
      
      <div className="status-content">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking, index) => {
            const status = getStatusDetails(booking.status);
            const displayPrice = booking.totalPrice || booking.total || 0; 
            const displayDate = booking.WorkDate || booking.date;
            const displayName = booking.details?.packageName || booking.packageName || "ไม่ระบุแพ็กเกจ";
            const isUnpaid = booking.payment === "unpaid" && booking.status !== 'cancelled';
            
            // ✅ เงื่อนไข: เฉพาะ in-progress เท่านั้นที่แก้ไข/ยกเลิกได้
            const canEditOrCancel = booking.status === 'in-progress';

            return (
              <div 
                key={booking._id || index} 
                className={`booking-item ${isUnpaid ? 'item-clickable' : ''}`} 
                onClick={() => handleCardClick(booking)}
                style={{ cursor: isUnpaid ? 'pointer' : 'default' }}
              >
                <div className={`booking-icon ${status.className}`}>{status.icon}</div>
                <div className="booking-details">
                  <p className="booking-package">{displayName}</p>
                  <p className="booking-date">วันที่จัดงาน: {displayDate ? new Date(displayDate).toLocaleDateString('th-TH') : '-'}</p>
                  {isUnpaid && booking.createdAt && <CountdownTimer createdAt={booking.createdAt} />}
                  {isUnpaid && (
                    <div style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                       <FiCreditCard /> <span>คลิกเพื่อชำระเงินทันที</span>
                    </div>
                  )}
                </div>
                <div className="booking-summary">
                  <span className={`status ${status.className}`}>{status.text}</span>
                  <p className="booking-total">{displayPrice.toLocaleString()} บาท</p>
                </div>

                {/* Overlay ปุ่มแก้ไข/ยกเลิก (แสดงเฉพาะตอน Hover และ in-progress) */}
                {canEditOrCancel && (
                    <div className="card-actions-overlay">
                        <button 
                            className="action-btn edit-btn"
                            onClick={(e) => handleEditBooking(e, booking._id, booking)}
                            title="แก้ไขรายการ"
                        >
                            <FiEdit /> แก้ไข
                        </button>
                        <button 
                            className="action-btn cancel-btn"
                            onClick={(e) => handleCancelBooking(e, booking._id)}
                            title="ยกเลิกรายการ"
                        >
                            <FiTrash2 /> ยกเลิก
                        </button>
                    </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="empty-state"><FiShoppingBag size={50} /><p>ไม่พบรายการจองในสถานะนี้</p></div>
        )}
      </div>
    </div>
  );
};

export default BookingStatusPage;