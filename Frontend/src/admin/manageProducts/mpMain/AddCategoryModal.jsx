import React, { useState } from 'react';
import './AddCategoryModal.css'; // เราจะสร้างไฟล์นี้ในขั้นตอนถัดไป

function AddCategoryModal({ onClose, onSubmit }) {
  // State สำหรับเก็บชื่อหมวดหมู่ใหม่
  const [categoryName, setCategoryName] = useState("");

  // ป้องกันการคลิกที่เนื้อหา Modal แล้ว Modal ปิด
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  // เมื่อกดยืนยัน (Submit)
  const handleSubmit = (e) => {
    e.preventDefault(); // ป้องกันการรีโหลดหน้า
    
    // Validation
    if (!categoryName || !categoryName.trim()) {
      alert("กรุณากรอกชื่อหมวดหมู่");
      return;
    }
    
    // ส่งค่าชื่อใหม่กลับไปให้ Parent (ManageProduct.js)
    onSubmit(categoryName);
    onClose(); // ปิด Modal
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={handleContentClick}>
        <div className="modal-header">
          <h2>เพิ่มหมวดหมู่ใหม่</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        
        {/* ใช้ <form> เพื่อให้กด Enter แล้ว Submit ได้ */}
        <form onSubmit={handleSubmit} className="modal-body">
          <label htmlFor="categoryNameInput">ชื่อหมวดหมู่:</label>
          <input
            id="categoryNameInput"
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="เช่น แพ็คเกจงานแต่ง"
            autoFocus // ให้ cursor ไปรอที่ช่องนี้เลย
          />
          <button type="submit" className="modal-submit-btn">
            บันทึก
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddCategoryModal;