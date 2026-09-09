import { useEffect, useState } from "react";
import "../Ordering/Ordering.css";
import axios from "axios";

function Ordering() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    DataOrderList();
  }, []);

  const DataOrderList = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/DataOrdering"
      );
      console.log(response.data.Ordering);
      return setOrders(response.data.Ordering);
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const calculateDaysRemaining = (workDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const target = new Date(workDate);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const formatThaiDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const showDetail = (cid) => {
    const data = orders.find((order) => order.cid === cid);
    if (data) {
      setSelectedOrder(data);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  return (
    <div className="Page-menu">
      <div className="Page-content">
        <div className="Ordering">
          <div className="Ordering-Header">
            <h1>รายการที่กำลังดำเนินการ</h1>
          </div>
          
          <div className="Ordering-List">
            {orders.map((order, index) => {
              const daysRemaining = calculateDaysRemaining(order.WorkDate);
              const isOverdue = daysRemaining < 0;
              const isToday = daysRemaining === 0;
           
              return (
                <div 
                  key={order.cid || index} 
                  className="Ordering-Card"
                  onClick={() => showDetail(order.cid)}
                >
                  <label>{order.username} {`อีก ${daysRemaining} วัน`}</label>
                  <div className="Ordering-Card-Content">
                    <h2>รายการคำสั่งซื้อ #{order.cid}</h2>
                    <p className={`days-remaining ${isOverdue ? 'overdue' : isToday ? 'today' : ''}`}>
                      {isOverdue && `อีก ${Math.abs(daysRemaining)} วัน`}
                      {isToday && 'วันนี้'}
                      {!isOverdue && !isToday && `อีก ${daysRemaining} วัน`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>รายการคำสั่งซื้อ #{selectedOrder.cid}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-info">
                <p><strong>UID:</strong> {selectedOrder.uid}</p>
                <p><strong>name:</strong> {selectedOrder.username}</p>
                <p><strong>lastname:</strong> {selectedOrder.lastname || '-'}</p>
                <p><strong>เบอร์โทรศัพท์:</strong> {selectedOrder.phone}</p>
                <p><strong>วันที่จัดงาน:</strong> {formatThaiDate(selectedOrder.WorkDate)} พ.ศ. {new Date(selectedOrder.WorkDate).getFullYear() + 543}</p>
                <p><strong>จำนวนโต๊ะ:</strong> {selectedOrder.table || '-'}</p>
                <p><strong>เวลาจัดงาน:</strong> {selectedOrder.WorkTime}</p>
              </div>

              <div className="modal-date">
                <h3>date</h3>
                <div className="date-info">
                  <p>วันที่สั่ง: {formatThaiDate(selectedOrder.createdAt)}</p>
                  <p>วันที่จัดงาน: {formatThaiDate(selectedOrder.WorkDate)}</p>
                  <p className="days-remaining-large">
                    เหลือเวลา: <span>{calculateDaysRemaining(selectedOrder.WorkDate)} วัน</span>
                  </p>
                </div>
              </div>

              {selectedOrder.details && (
                <div className="modal-details">
                  <h3>รายละเอียด:</h3>
                  <pre>{JSON.stringify(selectedOrder.details, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ordering;