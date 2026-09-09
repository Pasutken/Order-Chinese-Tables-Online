// ไฟล์: ManageProduct.jsx (ไฟล์แม่)

import { useState } from "react";
import "./manageProducts.css";
import { useNavigate } from "react-router-dom";
import ManageFood from "./manageFood/manageFood";
import ManageDrinks from "./manageDrink/manageDrink";

function ManageProduct({ url }) {
  const navigate = useNavigate();
  // State เหมือนเดิม
  const [currentView, setCurrentView] = useState("food"); 

  return (
    <div className="manageProducts-container">
      <h1>ManageProduct</h1>
      
      {/* --- 👇 (แทนที่ .toggle-switch-container เก่า ด้วยโค้ดนี้) --- */}
      <div className="sliding-toggle-bar">
        {/* Input Radio สำหรับ "อาหาร" */}
        <input
          type="radio"
          id="food-toggle"
          name="product-view" // (ชื่อเดียวกัน เพื่อให้เลือกได้แค่ 1 อัน)
          value="food"
          checked={currentView === "food"}
          onChange={() => setCurrentView("food")}
        />
        <label htmlFor="food-toggle" className={currentView === "food" ? "active" : ""}>
          จัดการแพ็คเกจอาหาร
        </label>

        {/* Input Radio สำหรับ "เครื่องดื่ม" */}
        <input
          type="radio"
          id="drink-toggle"
          name="product-view"
          value="drink"
          checked={currentView === "drink"}
          onChange={() => setCurrentView("drink")}
        />
        <label htmlFor="drink-toggle" className={currentView === "drink" ? "active" : ""}>
          จัดการแพ็คเกจเครื่องดื่ม
        </label>

        {/* ตัวเลื่อน/สไลด์ (Sliding Indicator) */}
        <div className="indicator"></div>
      </div>
      {/* --- ------------------------------------ --- */}

      {/* --- เนื้อหาที่สลับไปมา (เหมือนเดิม) --- */}
      <div className="tab-content">
        {currentView === "food" && (
          <ManageFood url={url} navigate={navigate} />
        )}

        {currentView === "drink" && (
          <ManageDrinks url={url} navigate={navigate} />
        )}
      </div>
    </div>
  );
}

export default ManageProduct;