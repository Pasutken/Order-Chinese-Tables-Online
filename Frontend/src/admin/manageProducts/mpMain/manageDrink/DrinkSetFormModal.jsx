import { useState, useEffect } from 'react';

// นี่คือ Modal Component ใหม่
function DrinkSetFormModal({ open, onClose, onSubmit, initialData }) {
  // (ถ้าไม่เปิด ก็ไม่ต้องแสดงผล)
  if (!open) return null;

  // State ภายใน Modal นี้
  const [formData, setFormData] = useState({
    setId: '',
    name: '',
    pricePerTable: 0,
    description: ''
  });

  // (สำคัญ) เมื่อ 'initialData' (ข้อมูลที่ส่งเข้ามา) เปลี่ยน 
  // ให้อัปเดตข้อมูลในฟอร์ม
  useEffect(() => {
    if (initialData) {
      setFormData(initialData); // (โหมดแก้ไข: เอาข้อมูลเก่ามาใส่)
    } else {
      // (โหมดเพิ่มใหม่: เคลียร์ฟอร์ม)
      setFormData({ setId: '', name: '', pricePerTable: 0, description: '' });
    }
  }, [initialData, open]); // (รันใหม่ทุกครั้งที่ Modal เปิด)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // (ส่งข้อมูลในฟอร์มกลับไปให้ handleSaveSet)
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{initialData ? 'แก้ไขเซ็ตเครื่องดื่ม' : 'เพิ่มเซ็ตเครื่องดื่มใหม่'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Set ID (ต้องไม่ซ้ำ เช่น setA, setB)</label>
            <input 
              name="setId" 
              value={formData.setId} 
              onChange={handleChange} 
              required 
              disabled={initialData ? true : false} // (ห้ามแก้ setId ตอน Edit)
            />
          </div>
          <div className="form-group">
            <label>ชื่อเซ็ต</label>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>ราคาต่อโต๊ะ</label>
            <input name="pricePerTable" type="number" value={formData.pricePerTable} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>คำอธิบาย (ไม่บังคับ)</label>
            <textarea name="description" value={formData.description} onChange={handleChange} />
          </div>
          
          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>ยกเลิก</button>
            <button type="submit" className="btn-save">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DrinkSetFormModal;