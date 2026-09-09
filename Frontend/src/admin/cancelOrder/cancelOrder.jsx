import { useEffect, useState } from "react";
import "./cancelOrder.css";
import axios from "axios";

function CancelOrder({ url }) {
  const [cancelOrder, setCancelOrder] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null); // State เก็บรายการที่ถูกเลือกเพื่อแสดง Popup

  // ฟังก์ชันโหลดข้อมูล
  const fetchOrders = () => {
    axios.get(`${url}/api/allcancelorder`)
      .then((res) => {
        setCancelOrder(res.data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchOrders();
  }, [url]);

  // ฟังก์ชันเปิด Popup
  const handleRowClick = (order) => {
    setSelectedOrder(order);
  };

  // ฟังก์ชันปิด Popup
  const closeModal = () => {
    setSelectedOrder(null);
  };

  // ฟังก์ชันกดปุ่ม "คืนเงินแล้ว"
  const handleConfirmRefund = async () => {
    if (!selectedOrder) return;
    
    const confirm = window.confirm(`ยืนยันว่าคืนเงินจำนวน ${selectedOrder.payback} บาท ให้คุณ ${selectedOrder.username} แล้ว?`);
    if (confirm) {
      try {
        // --- ตรงนี้ใส่ API เพื่ออัปเดตสถานะเป็น refunded ---
        // ตัวอย่าง: await axios.put(`${url}/api/confirmRefund/${selectedOrder._id}`);
        await axios.put(`${url}/api/paybackcheck/${selectedOrder._id}`)
        alert("บันทึกสถานะคืนเงินเรียบร้อย");
        closeModal();
        fetchOrders(); // โหลดข้อมูลใหม่เพื่ออัปเดตหน้าจอ
      } catch (err) {
        console.log(err);
        alert("เกิดข้อผิดพลาด");
      }
    }
  };

  return (
    <div className="cancel-order-container">
      <h2>รายการที่ถูกยกเลิก</h2>
      
      <div className="order-list">
        {cancelOrder.map((item) => (
          <div 
            key={item._id} 
            className="order-card" 
            onClick={() => handleRowClick(item)} // คลิกเพื่อเปิด Popup
          >
            <label>
              คุณ <b>{item.username}</b> ยกเลิก {item.details?.packageName || 'ไม่ระบุ'} 
              <br/>
              ค่ามัดจำที่ต้องจ่ายคืน <b className="payback-highlight">{item.payback?.toLocaleString()} บาท</b>
            </label>
          </div>
        ))}
      </div>

      {/* --- Popup Modal --- */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>รายละเอียดการคืนเงิน</h3>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              <p><strong>รหัสลูกค้า (CID):</strong> {selectedOrder.cid}</p>
              <p><strong>ชื่อลูกค้า:</strong> {selectedOrder.username}</p>
              <p><strong>เบอร์โทรศัพท์:</strong> {selectedOrder.phone}</p>
              <p><strong>วันที่จัดงาน:</strong> {new Date(selectedOrder.WorkDate).toLocaleDateString('th-TH')}</p>
              <hr />
              <p><strong>แพ็กเกจที่ยกเลิก:</strong> {selectedOrder.details?.packageName}</p>
              <p><strong>ราคารวมเดิม:</strong> {selectedOrder.totalPrice?.toLocaleString()} บาท</p>
              <div className="refund-highlight-box">
                <p>ยอดที่ต้องคืนเงินมัดจำ</p>
                <h1>{selectedOrder.payback?.toLocaleString()} บาท</h1>
              </div>
              
              {/* ตรงนี้อาจจะเพิ่มเลขบัญชีลูกค้า ถ้าใน Database มีเก็บไว้ */}
              {/* <p><strong>เลขบัญชี:</strong> {selectedOrder.bankAccount || '-'}</p> */}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>ปิดหน้าต่าง</button>
              <button className="btn-primary" onClick={handleConfirmRefund}>
                ยืนยันคืนเงินแล้ว
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CancelOrder;