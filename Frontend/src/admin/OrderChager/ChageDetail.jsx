import { useEffect, useState } from "react";
import "../OrderChager/ChageDetail.css";
import axios from "axios";

function ChageDetail() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null); // เก็บข้อมูลทั้งหมด (ทั้งเก่าและใหม่)
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrderList();
  }, []);

  // ดึงรายการที่มีสถานะ 'Order-Change-Processing'
  const fetchOrderList = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/DataOrderChagedetail");
      setOrders(response.data.detail || []);
    } catch (error) {
      console.error("Error fetching list:", error);
      setOrders([]);
    }
  };

  // เปิด Modal (ไม่ต้อง fetch ข้อมูลเดิมแยกแล้ว เพราะข้อมูลอยู่ในก้อนเดียวกัน)
  const showDetail = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const formatThaiDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
  };

  // ฟังก์ชันอนุมัติ (Accept) -> ใช้ PUT
  const handleAccept = async (cid) => {
    if(!window.confirm("ยืนยันการอนุมัติการเปลี่ยนแปลง?")) return;
    
    try {
      const response = await axios.put(
        `http://localhost:3000/api/DeleteOrderafterAcccept/${cid}`
      );
      console.log("Accepted:", response);
      alert("อนุมัติเรียบร้อย (ข้อมูลถูกอัปเดตแล้ว)");
      closeModal();
      fetchOrderList();
    } catch (error) {
      console.error("Accept Error:", error);
      alert("เกิดข้อผิดพลาดในการอนุมัติ");
    }
  };

  // ฟังก์ชันปฏิเสธ (Reject) -> ใช้ PUT
  const handleReject = async (cid) => {
    if(!window.confirm("ยืนยันปฏิเสธคำขอ?")) return;

    try {
      const response = await axios.put(
        `http://localhost:3000/api/DeleteOrderafterReject/${cid}`
      );
      console.log("Rejected:", response);
      alert("ปฏิเสธคำขอเรียบร้อย");
      closeModal();
      fetchOrderList();
    } catch (error) {
      console.error("Reject Error:", error);
      alert("เกิดข้อผิดพลาดในการปฏิเสธ");
    }
  };

  // Helper: แสดงรายการอาหารเปรียบเทียบ (ซ้าย vs ขวา)
  const renderItemComparison = () => {
    if (!selectedOrder) return null;

    // 1. รายการเดิม (จาก details ปกติ)
    const oldDishes = selectedOrder.details?.selectedDishes || []; 
    // แปลงข้อมูลเผื่อเป็น Object {name: '...'} หรือ String
    const oldItems = oldDishes.map(d => (typeof d === 'string' ? d : d.name));

    // 2. รายการใหม่ (จาก changeRequest.details)
    const newDishes = selectedOrder.changeRequest?.details?.selectedDishes || [];
    const newItems = newDishes.map(d => (typeof d === 'string' ? d : d.name));
    
    // หาจำนวนแถวสูงสุดเพื่อสร้าง Loop
    const maxRows = Math.max(oldItems.length, newItems.length);
    const rows = [];

    for (let i = 0; i < maxRows; i++) {
      rows.push(
        <div key={i} className="item-row">
          <span className={`old-item ${!oldItems[i] ? "empty" : ""}`}>
            {oldItems[i] || "-"}
          </span>
          <span className="arrow">→</span>
          <span className={`new-item ${!newItems[i] ? "empty" : ""}`}>
            {newItems[i] || "-"}
          </span>
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="Page-menu">
      <div className="Page-content">
        <div className="Ordering">
          <div className="Ordering-Header">
            <h1>รายการที่ต้องเปลี่ยนกำหนดการ</h1>
          </div>

          <div className="Ordering-List">
            {orders.length === 0 ? <p style={{textAlign:'center', marginTop:'20px'}}>ไม่มีรายการคำขอ</p> : null}
            {orders.map((order) => (
              <div
                key={order.cid}
                className="Ordering-Card"
                onClick={() => showDetail(order)}
              >
                <div className="Ordering-Card-Header">
                  <h2>รายการคำสั่งซื้อ #{order.cid}</h2>
                  <p>ลูกค้า: {order.username}</p>
                  {/* แสดงวันที่ขอยื่นเรื่อง (ถ้ามี) */}
                  <p style={{fontSize: '0.8rem', color: '#666'}}>
                    ยื่นเรื่องเมื่อ: {formatThaiDate(order.changeRequest?.requestDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>ตรวจสอบการเปลี่ยนแปลง #{selectedOrder.cid}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-info">
                <p><strong>ชื่อลูกค้า:</strong> {selectedOrder.username}</p>
                
                {/* 1. เปรียบเทียบวันที่จัดงาน */}
                <div className="date-comparison-box">
                   <strong>วันที่จัดงาน (Work Date):</strong>
                   <div className="comparison-row">
                      {/* วันที่เดิม */}
                      <span className="old-val">{formatThaiDate(selectedOrder.WorkDate)}</span>
                      <span className="arrow">→</span>
                      {/* วันที่ใหม่ (สีแดง) */}
                      <span className="new-val" style={{color: '#d32f2f', fontWeight: 'bold'}}>
                        {formatThaiDate(selectedOrder.changeRequest?.WorkDate)}
                      </span>
                   </div>
                </div>

                {/* 2. เปรียบเทียบราคารวม (ถ้าต้องการดู) */}
                <div className="date-comparison-box" style={{marginTop: '10px'}}>
                   <strong>ราคารวม (Total Price):</strong>
                   <div className="comparison-row">
                      <span className="old-val">{selectedOrder.totalPrice?.toLocaleString()} บาท</span>
                      <span className="arrow">→</span>
                      <span className="new-val">
                        {selectedOrder.changeRequest?.totalPrice?.toLocaleString()} บาท
                      </span>
                   </div>
                   {/* แสดงส่วนต่างราคา */}
                   {selectedOrder.changeRequest?.priceDifference !== 0 && (
                       <div style={{fontSize: '0.9rem', marginTop: '5px'}}>
                           ส่วนต่าง: <span style={{color: selectedOrder.changeRequest?.priceDifference > 0 ? 'red' : 'green', fontWeight:'bold'}}>
                             {selectedOrder.changeRequest?.priceDifference > 0 ? '+' : ''}
                             {selectedOrder.changeRequest?.priceDifference?.toLocaleString()} บาท
                           </span>
                           {selectedOrder.changeRequest?.priceDifference > 0 ? " (ต้องจ่ายเพิ่ม)" : " (ต้องคืนเงิน)"}
                       </div>
                   )}
                </div>
              </div>

              <div className="modal-date">
                <h3>เปรียบเทียบรายการอาหาร (Items)</h3>
                <div className="date-info">
                  <div className="order-comparison">
                    <div className="comparison-header">
                      <span>รายการเดิม</span>
                      <span></span>
                      <span>รายการใหม่ (คำขอ)</span>
                    </div>

                    <div className="items-comparison">
                      {renderItemComparison()}
                    </div>

                    {/* 3. เปรียบเทียบหมายเหตุ */}
                    <div className="notes-comparison">
                        <h4>หมายเหตุ (Remarks)</h4>
                        <div className="item-row">
                            <span className="old-item">{selectedOrder.details?.remarks || "-"}</span>
                            <span className="arrow">→</span>
                            <span className="new-item">{selectedOrder.changeRequest?.details?.remarks || "-"}</span>
                        </div>
                    </div>

                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-accept" onClick={() => handleAccept(selectedOrder.cid)}>
                  อนุมัติ (Accept)
                </button>
                <button className="btn-reject" onClick={() => handleReject(selectedOrder.cid)}>
                  ปฏิเสธ (Reject)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChageDetail;