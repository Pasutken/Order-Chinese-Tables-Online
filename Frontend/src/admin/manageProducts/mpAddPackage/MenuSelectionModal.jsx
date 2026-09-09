import React, { useEffect, useState } from "react";
import "./MenuSelectionModal.css";
import axios from "axios";

function MenuSelectionModal({ menuItems, onSelect, onClose, url }) {
  const [categoryMenu, setCategoryMenu] = useState([]);

  // --- 1. (ใหม่!) State สำหรับเก็บหมวดหมู่ที่กำลังกรอง ---
  // (null = แสดงทั้งหมด)
  const [currentCategory, setCurrentCategory] = useState(null);

  useEffect(() => {
    axios
      .get(`${url}/api/mpmenu/getmenucategory`)
      .then((res) => {
        console.log("categoryMenu", res.data);
        setCategoryMenu(res.data);
      })
      .catch((err) => console.log(err));
  }, [url]); // (แนะนำให้ใส่ [url] ใน dependency array)

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  const handleSelectMenu = (itemId) => {
    onSelect(itemId);
    onClose();
  };

  // --- 2. (ใหม่!) Logic สำหรับกรองเมนู ---
  const filteredMenuItems = menuItems.filter((item) => {
    // ถ้า currentCategory เป็น null (ปุ่ม "ทั้งหมด")
    if (currentCategory === null) {
      return true; // แสดงทุกรายการ
    }
    // ถ้าเลือกหมวดหมู่ ให้แสดงเฉพาะที่ตรงกัน
    return item.category === currentCategory;
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={handleContentClick}>
        <div className="modal-header">
          <h2>กรุณาเลือกเมนู</h2>
          <button onClick={onClose} className="modal-close-btn">
            &times;
          </button>
        </div>

        {/* --- 3. (ใหม่!) แถบปุ่มกรอง (Filter Tabs) --- */}
        <div className="modal-filter-tabs">
          <button
            // (เช็กว่า active หรือไม่)
            className={`modal-tab-btn ${
              currentCategory === null ? "active" : ""
            }`}
            onClick={() => setCurrentCategory(null)}
          >
            ทั้งหมด
          </button>

          {/* วนลูปปุ่มหมวดหมู่ */}
          {Array.isArray(categoryMenu) && categoryMenu.length > 0
            ? categoryMenu.map((cat) => (
                <button
                  key={cat._id}
                  className={`modal-tab-btn ${
                    currentCategory === cat._id ? "active" : ""
                  }`}
                  onClick={() => setCurrentCategory(cat._id)}
                >
                  {cat.categoryMenu}
                </button>
              ))
            : // (ถ้า categoryMenu ไม่ใช่ Array หรือเป็น Array ว่าง ให้แสดงผลเป็น "ว่างเปล่า")
              null}
        </div>

        {/* --- 4. (แก้ไข) วนลูปจาก filteredMenuItems --- */}
        <div className="modal-body">
          {filteredMenuItems.length > 0 ? (
            // (ใช้ filteredMenuItems แทน menuItems)
            filteredMenuItems.map((item) => (
              <div
                key={item._id}
                className="menu-item-option"
                onClick={() => handleSelectMenu(item._id)}
              >
                <span>
                  {item.name} ({item.price} บาท)
                </span>
              </div>
            ))
          ) : (
            // (เปลี่ยนข้อความเล็กน้อย)
            <p>ไม่พบรายการเมนูในหมวดหมู่นี้</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MenuSelectionModal;
