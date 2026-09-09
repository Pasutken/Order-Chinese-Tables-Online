import React, { useState } from 'react';
import './CategoryActionModal.css'; 

// 1. (แก้ไข) เพิ่ม props: 'category' (สำหรับแสดงชื่อเดิม) และ 'onSave'
function CategoryActionModal({ category, onClose, onSave, onDelete }) {
  
  // 2. (ใหม่) สร้าง state ภายในสำหรับเก็บชื่อใหม่
  const [newName, setNewName] = useState(category.categoryName);

  const handleContentClick = (e) => e.stopPropagation();

  // 3. (ใหม่) เมื่อกด "บันทึก"
  const handleSave = (e) => {
    e.preventDefault(); // ป้องกันฟอร์มรีโหลด
    
    // Validation
    if (!newName || !newName.trim()) {
      alert("ชื่อหมวดหมู่ห้ามว่าง");
      return;
    }
    
    // ถ้าชื่อไม่เปลี่ยนแปลง ก็แค่ปิด
    if (newName.trim() === category.categoryName) {
      onClose();
      return;
    }

    // ส่งชื่อใหม่กลับไปให้ ManageProduct.js
    onSave(newName.trim());
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={handleContentClick}>
        <div className="modal-header">
          <h2>แก้ไขหมวดหมู่</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        
        {/* 4. (แก้ไข) เปลี่ยนเนื้อหาเป็น <form> */}
        <form className="modal-body-form" onSubmit={handleSave}>
          <label htmlFor="categoryNameEditInput">ชื่อหมวดหมู่:</label>
          <input
            id="categoryNameEditInput"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          
          {/* 5. (ใหม่) ส่วน Footer สำหรับปุ่ม */}
          <div className="modal-footer">
            <button 
              type="button" 
              className="modal-action-btn btn-delete" 
              onClick={onDelete} // onRemove ยังมาจาก prop
            >
              <i className="bi bi-trash3"></i> ลบ
            </button>
            <button 
              type="submit" 
              className="modal-action-btn btn-save"
            >
              <i className="bi bi-check-lg"></i> บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryActionModal;