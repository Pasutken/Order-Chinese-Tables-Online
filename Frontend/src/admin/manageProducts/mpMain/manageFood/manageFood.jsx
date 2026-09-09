import { useEffect, useState } from "react";
import "../manageProducts.css";
import "./manageFood.css" // (อย่าลืม import CSS ของตัวเอง)
import axios from "axios";
import AddCategoryModal from "../AddCategoryModal";
import CategoryActionModal from "../CategoryActionModal";

function ManageFood({ url, navigate }) {
  // (State ทั้งหมดที่เกี่ยวกับอาหารอยู่ที่นี่)
  const [category, setCategory] = useState([]);
  const [Package, setPackage] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // (useEffect ดึงข้อมูล - เหมือนเดิม)
  useEffect(() => {
    axios
      .get(`${url}/api/mpmain/getpackagecategory`)
      .then((res) => setCategory(res.data))
      .catch((err) => console.log(err));
    axios
      .get(`${url}/api/mppackage/getpackage`)
      .then((res) => setPackage(res.data))
      .catch((err) => console.log(err));
  }, [url,Package]);

  // --- (ฟังก์ชัน CRUD หมวดหมู่ - เหมือนเดิม) ---
  const handleSubmitCategory = async (newCategoryName) => {
    try {
      const response = await axios.post(
        `${url}/api/mpmain/addpackagecategory`,
        { categoryName: newCategoryName, type: 'food' } 
      );
      setCategory((prevCategories) => [...prevCategories, response.data]);
      setIsAddModalOpen(false);
    } catch (err) { console.error("Error adding category:", err); }
  };
  const openActionModal = (categoryItem) => {
    setSelectedCategory(categoryItem);
    setIsActionModalOpen(true);
  };
  const closeActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedCategory(null);
  };
  const handleSaveCategory = (newName) => {
    if (!selectedCategory) return; 
    axios
      .put(`${url}/api/mpmain/updatepackagecategory/${selectedCategory._id}`, {
        categoryName: newName,
      })
      .then((res) => {
        setCategory((prev) =>
          prev.map((cat) => (cat._id === selectedCategory._id ? res.data : cat))
        );
        closeActionModal();
      })
      .catch((err) => { console.error("Error updating category:", err); });
  };
  const handleDeleteCategory = () => {
    if (!selectedCategory) return;
    const packagesInCategory = Package.filter(
      (pkg) => pkg.category === selectedCategory._id
    ).length;
    if (packagesInCategory > 0) {
      alert(
        `ไม่สามารถลบหมวดหมู่นี้ได้ เนื่องจากยังมีแพ็คเกจ (${packagesInCategory} รายการ) อยู่ในหมวดหมู่นี้`
      );
      closeActionModal();
      return;
    }
    if (
      window.confirm(
        `คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${selectedCategory.categoryName}"?`
      )
    ) {
      axios
        .delete(
          `${url}/api/mpmain/deletepackagecategory/${selectedCategory._id}`
        )
        .then(() => {
          setCategory((prev) =>
            prev.filter((cat) => cat._id !== selectedCategory._id)
          );
          closeActionModal();
        })
        .catch((err) => { console.error("Error deleting category:", err); });
    }
  };

  async function handleDeletePackage(packageId){
    axios.delete(`${url}/api/mppackage/deletepackage/${packageId}`)
    .then((res) => {
      console.log(res.data)
    }).catch((err) => console.log(err))
  }
  
  // --- 👇 1. (เพิ่ม Logic) คำนวณหาแพ็คเกจที่ไม่มีหมวดหมู่ ---
  // ดึง ID ของหมวดหมู่ทั้งหมดที่มีอยู่
  const categoryIds = category.map(c => c._id);
  
  // กรองหาแพ็คเกจที่ไม่มีหมวดหมู่ (pkg.category เป็น null, undefined, "")
  // หรือ ID หมวดหมู่ไม่ถูกต้อง (ไม่มีอยู่ใน categoryIds)
  const uncategorizedPackages = Package.filter(
    pkg => !pkg.category || !categoryIds.includes(pkg.category)
  );
  // --- (สิ้นสุดส่วน Logic) ---

  // --- 2. (แก้ไข) ส่วน Return (JSX) ---
  return (
    <>
      <div className="food-actions-container">
        <div className="mp-btn-container">
          <button onClick={() => navigate("/mpaddpackage")}>
            <i className="bi bi-plus-square-fill"></i> เพิ่มแพ็คเกจอาหาร
          </button>
          <button onClick={() => navigate("/mpmenu")}>
            <i className="bi bi-plus-square-fill"></i> จัดการเมนู
          </button>
        </div>
        <button
          className="add-category-btn"
          onClick={() => setIsAddModalOpen(true)}
        >
          <i className="bi bi-plus-square-fill"></i> เพิ่มหมวดหมู่อาหาร
        </button>
      </div>

      <div className="package-container">
        
        {/* (ส่วน .map() เดิมของคุณที่แสดงหมวดหมู่) */}
        {category.map((item) => (
          <div key={item._id} className="package">
            <div className="packagename-container">
              <b>{item.categoryName}</b>
              <button
                className="edit-btn"
                onClick={() => openActionModal(item)}
              >
                <i className="bi bi-pencil-square"></i>
              </button>
            </div>
            {Package.filter((pkg) => pkg.category == item._id).map(
              (filteredPkg) => (
                <div key={filteredPkg._id} className="package-item">
                  <button
                    onClick={() =>
                      navigate(`/mpeditpackage/${filteredPkg._id}`)
                    }
                  >
                    {filteredPkg.name}
                  </button>
                    <button className="deletepackage-btn" onClick={() => handleDeletePackage(filteredPkg._id)}>x</button>
                </div>
              )
            )}
          </div>
        ))}

        {/* --- 👇 นี่คือส่วนที่เพิ่มเข้ามาใหม่ --- */}
        {uncategorizedPackages.length > 0 && (
          <div className="package package-uncategorized">
            <div className="packagename-container">
              <b>
                <i className="bi bi-question-circle-fill"></i>
                แพ็คเกจที่ไม่มีหมวดหมู่
              </b>
            </div>
            
            {/* (Map เฉพาะแพ็คเกจที่ไม่มีหมวดหมู่) */}
            {uncategorizedPackages.map((filteredPkg) => (
              <div key={filteredPkg._id} className="package-item">
                <button
                  onClick={() =>
                    navigate(`/mpeditpackage/${filteredPkg._id}`)
                  }
                >
                  {filteredPkg.name}
                  {/* (แนะนำ) เพิ่มส่วนนี้เพื่อแสดง ID ที่มีปัญหา */}
                  <span className="uncategorized-note">(ID: {filteredPkg._id})</span>
                </button>
              </div>
            ))}
          </div>
        )}
        {/* --- --------------------------- --- */}

      </div>

      {/* (Modal ของคุณเหมือนเดิม) */}
      {isAddModalOpen && (
        <AddCategoryModal
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleSubmitCategory}
        />
      )}
      {isActionModalOpen && selectedCategory && (
        <CategoryActionModal
          category={selectedCategory} 
          onClose={closeActionModal}
          onSave={handleSaveCategory}
          onDelete={handleDeleteCategory}
        />
      )}
    </>
  );
}

export default ManageFood;