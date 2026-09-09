import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BookingSummary.css"; 

const BookingSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const allData = location.state || {};

  useEffect(() => {
    if (!allData.packageName) {
      alert("ไม่พบข้อมูลการจอง กรุณาเริ่มต้นใหม่ครับ");
      navigate("/");
    }
  }, [allData, navigate]);

  const formatAddress = (address) => {
    if (!address) return "ไม่ได้ระบุที่อยู่"; 
    const parts = [
      address.houseNoMoo,
      address.soi ? `ซอย ${address.soi}` : null,
      address.street ? `ถนน ${address.street}` : null,
      address.subDistrict ? `ต/แขวง ${address.subDistrict}` : null,
      address.district ? `อ/เขต ${address.district}` : null,
      address.province ? `จ. ${address.province}` : null,
      address.zipCode,
    ];
    return parts.filter(Boolean).join(", ");
  };

  const handleConfirmBooking = async () => {
    const token = localStorage.getItem("token");
    setIsSubmitting(true);

    // ตรวจสอบว่าเป็นการแก้ไข หรือ สร้างใหม่ (เพื่อใช้ API ให้ถูก)
    // ตรงนี้สมมติว่าใช้ endpoint เดิม แต่ถ้าแก้ไขอาจต้องใช้ PUT /api/bookings/:id หรือ endpoint เฉพาะ
    // หาก Backend คุณใช้ endpoint เดิมก็ไม่ต้องแก้ URL
    const apiUrl = 'http://localhost:3000/api/bookings';

    try {
      const response = await fetch(apiUrl, {
        method: allData.isEditing ? 'PUT' : 'POST', // สมมติว่าใช้ PUT เมื่อแก้ไข
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        // ส่งข้อมูลทั้งหมดไป รวมถึง bookingId ถ้ามี
        body: JSON.stringify(allData),
      });

      const savedRecord = await response.json(); 

      if (!response.ok) {
        throw new Error(savedRecord.message || 'การส่งข้อมูลไม่สำเร็จ');
      }

      // คำนวณยอดที่จะส่งไปหน้า Payment
      // ถ้าเป็นการแก้ไข: ให้ส่งยอด "ส่วนต่าง" (Price Difference) ไป
      // ถ้าเป็นการจองใหม่: ส่งยอดรวมปกติ
      let paymentAmount = savedRecord.totalPrice;
      if (allData.isEditing) {
          // ถ้าส่วนต่างเป็นบวก คือต้องจ่ายเพิ่ม ให้ส่งยอดนั้นไป
          // ถ้าส่วนต่างติดลบ หรือ 0 อาจไม่ต้องจ่าย (หรือจัดการเรื่องคืนเงินทีหลัง)
          paymentAmount = allData.priceDifference > 0 ? allData.priceDifference : 0;
      }

      navigate("/payment", { 
        state: {
          bookingId: savedRecord._id,
          totalPrice: paymentAmount,
          username: savedRecord.username,
          isDifferencePayment: allData.isEditing // ส่ง Flag ไปบอกหน้า Payment ว่านี่คือการจ่ายส่วนต่าง
        } 
      });

    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      alert(error.message || 'เกิดข้อผิดพลาดในการยืนยันการจอง');
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    // กลับไปหน้าก่อนหน้า (MenuSelection) พร้อม state เดิม
    navigate(-1);
  };

  const isEditing = allData.isEditing;

  if (!allData.packageName) {
    return (
      <div style={{ textAlign: "center", marginTop: "40px", fontFamily: "Kanit" }}>
        กำลังตรวจสอบข้อมูล...
      </div>
    );
  }

  return (
    <div className="summary-container">
      <h1>{isEditing ? "สรุปการแก้ไขรายการ" : "สรุปรายการจอง"}</h1>

      <div className="summary-section">
        <h2>ข้อมูลลูกค้าและการจัดงาน</h2>
        <div className="info-grid">
          <strong>ชื่อผู้ติดต่อ:</strong>
          <span>{allData.contactName}</span>

          <strong>เบอร์โทรศัพท์:</strong>
          <span>{allData.phone}</span>

          {allData.lineId && (
            <>
              <strong>LINE ID:</strong>
              <span>{allData.lineId}</span>
            </>
          )}
            
          {allData.email && (
            <>
              <strong>Email:</strong>
              <span>{allData.email}</span>
            </>
          )}

          <strong>วันที่จัดงาน:</strong>
          <span>
            {allData.eventDate 
              ? new Date(allData.eventDate).toLocaleDateString("th-TH", { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) 
              : "ไม่ได้ระบุ"}
          </span>
          
          <strong>เวลาเริ่มงาน:</strong>
          <span>{allData.eventTime ? `${allData.eventTime} น.` : "ไม่ได้ระบุ"}</span>

          <strong>สถานที่จัดงาน:</strong>
          <span>{allData.location || "ไม่ได้ระบุ"}</span>

          <strong>ที่อยู่จัดส่ง:</strong>
          <span>{formatAddress(allData.address)}</span>
          
          {allData.remarks && (
            <>
              <strong>หมายเหตุ:</strong>
              <span>{allData.remarks}</span>
            </>
          )}
        </div>
      </div>

      <div className="summary-section">
        <h2>รายการอาหาร ({allData.tableCount} โต๊ะ)</h2>
        
        <div className="order-details">
          <h3>{allData.packageName}</h3>
          
          {/* แสดงรายการอาหาร */}
          <ul className="dish-list">
            {allData.selectedDishes && allData.selectedDishes.map((dish, index) => (
              <li key={index} className="price-row" style={{ marginBottom: '5px' }}>
                {/* เช็คว่าเป็น Object เพื่อดึง name และหลีกเลี่ยง Error */}
                <span>- {typeof dish === 'object' ? dish.name : dish}</span>
                {typeof dish === 'object' && dish.totalPrice && (
                    <span style={{color: '#666', fontSize: '0.9em'}}>
                        {dish.totalPrice.toLocaleString()} บาท
                    </span>
                )}
              </li>
            ))}
          </ul>

          <div className="price-row" style={{ marginTop: '10px', borderTop: '1px dashed #ddd', paddingTop: '10px' }}>
            <span>ค่าอาหารรวม ({allData.tableCount} โต๊ะ)</span>
            <strong>{(allData.foodSubtotal || 0).toLocaleString()} บาท</strong>
          </div>
        </div>

        {/* อาหาร Add-on */}
        {allData.selectedAddonFoods && allData.selectedAddonFoods.length > 0 && (
          <div className="order-details">
            <h3>อาหารสั่งเพิ่ม</h3>
            <ul className="item-list">
              {allData.selectedAddonFoods.map((item, index) => (
                <li key={index} className="price-row">
                  <span>- {item.name} (x{item.quantity})</span>
                  <strong>{item.total.toLocaleString()} บาท</strong>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* เครื่องดื่ม */}
        <div className="order-details">
          <h3>เครื่องดื่ม</h3>
          {allData.selectedDrinkSet && (
            <div className="price-row">
              <span>- {allData.selectedDrinkSet.name} (x{allData.tableCount} โต๊ะ)</span>
              <strong>{allData.selectedDrinkSet.totalPrice.toLocaleString()} บาท</strong>
            </div>
          )}
          
          {allData.selectedDrinks && allData.selectedDrinks.length > 0 && (
            <ul className="item-list">
              {allData.selectedDrinks.map((item, index) => (
                <li key={index} className="price-row">
                  <span>- {item.name} (x{item.quantity})</span>
                  <strong>{item.total.toLocaleString()} บาท</strong>
                </li>
              ))}
            </ul>
          )}

          {!allData.selectedDrinkSet && (!allData.selectedDrinks || allData.selectedDrinks.length === 0) && (
             <p>ไม่ได้เลือกเครื่องดื่มเพิ่มเติม</p>
          )}
        </div>
      </div>

      {/* 🔥 ส่วนสรุปยอดเงิน (Updated UI for Editing) */}
      <div className="grand-total-summary final-total"> 
        
        {isEditing ? (
            // กรณีแก้ไข: แสดงเทียบราคาเดิม vs ใหม่ และส่วนต่าง
            <div style={{ width: '100%' }}>
                <div className="summary-row" style={{ color: '#666' }}>
                    <span>ยอดเดิม</span>
                    <span>{(allData.originalPrice || 0).toLocaleString()} บาท</span>
                </div>
                <div className="summary-row" style={{ color: '#666' }}>
                    <span>ยอดใหม่ (ทั้งสิ้น)</span>
                    <span>{(allData.grandTotal || 0).toLocaleString()} บาท</span>
                </div>
                <div className="summary-divider"></div>
                
                {/* แสดงผลตามส่วนต่าง บวก/ลบ */}
                {allData.priceDifference > 0 ? (
                    <div className="summary-row total" style={{ color: '#d32f2f' }}>
                        <span>ยอดชำระเพิ่ม</span>
                        <span>{allData.priceDifference.toLocaleString()} บาท</span>
                    </div>
                ) : allData.priceDifference < 0 ? (
                    <div className="summary-row total" style={{ color: '#388e3c' }}>
                        <span>ยอดเงินคืน</span>
                        <span>{Math.abs(allData.priceDifference).toLocaleString()} บาท</span>
                    </div>
                ) : (
                    <div className="summary-row total">
                        <span>ยอดชำระเพิ่ม</span>
                        <span>0 บาท</span>
                    </div>
                )}
            </div>
        ) : (
            // กรณีจองใหม่ปกติ
            <div className="summary-row total">
                <span>ยอดรวมทั้งสิ้น</span>
                <span>{(allData.grandTotal || 0).toLocaleString()} บาท</span>
            </div>
        )}
        
      </div>

      <div className="summary-actions">
        <button 
          className="btn-back" 
          onClick={handleGoBack}
          disabled={isSubmitting}
        >
          กลับไปแก้ไข
        </button>
        <button 
          className="btn-confirm" 
          onClick={handleConfirmBooking}
          disabled={isSubmitting}
        >
          {isSubmitting ? "กำลังบันทึก..." : (isEditing ? "ยืนยันการแก้ไข" : "ยืนยันและไปหน้าชำระเงิน")}
        </button>
      </div>
    </div>
  );
};

export default BookingSummary;