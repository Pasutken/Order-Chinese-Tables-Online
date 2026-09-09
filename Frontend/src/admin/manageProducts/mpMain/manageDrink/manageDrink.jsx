import { useEffect, useState } from "react";
import "../manageProducts.css";
import "./manageDrink.css"
import axios from 'axios'; // 1. เปลี่ยนจาก 'api' มาเป็น 'axios'
import DrinkSetFormModal from "./DrinkSetFormModal";

// (Component ย่อย DrinkItemForm เหมือนเดิม)
function DrinkItemForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(
    initialData || { name: "", price: "", unit: "" }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="item-form">
      <input name="name" value={formData.name} onChange={handleChange} placeholder="ชื่อ (เช่น โค้ก)" required />
      <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="ราคา" required />
      <input name="unit" value={formData.unit} onChange={handleChange} placeholder="หน่วย (เช่น กระป๋อง)" required />
      <button type="submit" className="btn-save-item">บันทึก</button>
      <button type="button" className="btn-cancel-item" onClick={onCancel}>ยกเลิก</button>
    </form>
  );
}

// --- Component หลัก ---
function ManageDrinks({ url, navigate }) { // 2. ใช้ 'url' ที่ส่งมา
  // (States ทั้งหมดเหมือนเดิม)
  const [view, setView] = useState('categories'); 
  const [categories, setCategories] = useState([]);
  const [addingToCategory, setAddingToCategory] = useState(null); 
  const [editingItem, setEditingItem] = useState(null); 
  const [sets, setSets] = useState([]);
  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState(null);

  // 4. โหลดข้อมูลทั้งหมด (ใช้ .then/.catch และ url)
  useEffect(() => {
    fetchCategories();
    fetchSets();
  }, [url]); // (เพิ่ม url ใน dependency array)

  const fetchCategories = () => {
    axios.get(`${url}/api/mpdrink/categories`) // 3. ใช้ url
      .then(res => setCategories(res.data))
      .catch(err => console.error("Error fetching categories:", err));
  };
  const fetchSets = () => {
    axios.get(`${url}/api/mpdrink/sets`) // 3. ใช้ url
      .then(res => setSets(res.data))
      .catch(err => console.error("Error fetching sets:", err));
  };

  // --- 5. ฟังก์ชัน CRUD หมวดหมู่ (Category) (เปลี่ยนเป็น .then/.catch) ---
  const handleAddCategory = () => {
    const name = prompt("ป้อนชื่อหมวดหมู่ใหม่ (เช่น น้ำอัดลม):");
    if (!name) return;
    
    axios.post(`${url}/api/mpdrink/category`, { name })
      .then(res => {
        setCategories([...categories, res.data]);
      })
      .catch(err => {
        alert(err.response?.data?.message || 'Error');
      });
  };

  const handleEditCategory = (category) => {
    const newName = prompt("ป้อนชื่อหมวดหมู่ใหม่:", category.name);
    if (!newName || newName === category.name) return;

    axios.put(`${url}/api/mpdrink/category/${category._id}`, { name: newName })
      .then(res => {
        setCategories(categories.map(c => c._id === category._id ? res.data : c));
      })
      .catch(err => {
        alert(err.response?.data?.message || 'Error');
      });
  };

  const handleDeleteCategory = (id) => {
    if (!window.confirm("ยืนยันการลบหมวดหมู่? (ต้องไม่มีรายการข้างใน)")) return;

    axios.delete(`${url}/api/mpdrink/category/${id}`)
      .then(() => {
        setCategories(categories.filter(c => c._id !== id));
      })
      .catch(err => {
        alert(err.response?.data?.message || 'Error');
      });
  };

  // --- 6. ฟังก์ชัน CRUD รายการย่อย (Item) (เปลี่ยนเป็น .then/.catch) ---
  const handleAddItem = (categoryId, itemData) => {
    axios.post(`${url}/api/mpdrink/category/${categoryId}/item`, itemData)
      .then(res => {
        setCategories(categories.map(c => c._id === categoryId ? res.data : c));
        setAddingToCategory(null); // ปิดฟอร์ม
      })
      .catch(err => {
        alert(err.response?.data?.message || 'Error');
      });
  };

  const handleEditItem = (categoryId, itemId, itemData) => {
    axios.put(`${url}/api/mpdrink/category/${categoryId}/item/${itemId}`, itemData)
      .then(res => {
        setCategories(categories.map(c => c._id === categoryId ? res.data : c));
        setEditingItem(null); // ปิดฟอร์ม
      })
      .catch(err => {
        alert(err.response?.data?.message || 'Error');
      });
  };

  const handleDeleteItem = (categoryId, itemId) => {
    if (!window.confirm("ยืนยันการลบรายการนี้?")) return;
    
    axios.delete(`${url}/api/mpdrink/category/${categoryId}/item/${itemId}`)
      .then(res => {
        setCategories(categories.map(c => c._id === categoryId ? res.data : c));
      })
      .catch(err => {
        alert(err.response?.data?.message || 'Error');
      });
  };
  
  // --- 7. ฟังก์ชัน CRUD เซ็ต (Set) (เปลี่ยนเป็น .then/.catch) ---
  const handleSaveSet = (setData) => {
    let request;
    if (editingSet) { // (โหมดแก้ไข)
      request = axios.put(`${url}/api/mpdrink/set/${editingSet._id}`, setData);
    } else { // (โหมดเพิ่มใหม่)
      request = axios.post(`${url}/api/mpdrink/set`, setData);
    }

    request.then(res => {
        if (editingSet) {
          setSets(sets.map(s => s._id === editingSet._id ? res.data : s));
        } else {
          setSets([...sets, res.data]);
        }
        setIsSetModalOpen(false);
        setEditingSet(null);
      })
      .catch(err => {
        alert(err.response?.data?.message || 'Error');
      });
  };
  
  const handleDeleteSet = (id) => {
     if (!window.confirm("ยืนยันการลบเซ็ตนี้?")) return;
     
     axios.delete(`${url}/api/mpdrink/set/${id}`)
       .then(() => {
         setSets(sets.filter(s => s._id !== id));
       })
       .catch(err => {
         alert(err.response?.data?.message || 'Error');
       });
  };

  // (ส่วน Return JSX เหมือนเดิมทุกประการ)
  return (
    <div className="manage-drinks-container">
      {/* --- Tabs ย่อย --- */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${view === 'categories' ? 'active' : ''}`}
          onClick={() => setView('categories')}
        >
          จัดการหมวดหมู่และรายการ
        </button>
        <button
          className={`tab-btn ${view === 'sets' ? 'active' : ''}`}
          onClick={() => setView('sets')}
        >
          จัดการเซ็ตเครื่องดื่ม
        </button>
      </div>

      {/* --- View 1: จัดการหมวดหมู่และรายการ --- */}
      {view === 'categories' && (
        <div className="categories-view">
          <button className="add-category-btn" onClick={handleAddCategory}>
            <i className="bi bi-plus-square-fill"></i> เพิ่มหมวดหมู่ใหม่
          </button>
          
          <div className="package-container">
            {categories.map(cat => (
              <div key={cat._id} className="package drink-category">
                <div className="packagename-container">
                  <b>{cat.name} (มี {cat.items.length} รายการ)</b>
                  <button className="edit-btn" onClick={() => handleEditCategory(cat)}>
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button className="delete-btn-simple" onClick={() => handleDeleteCategory(cat._id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
                
                {/* --- รายการย่อย (Items) --- */}
                <div className="drink-items-list">
                  {cat.items.map(item => (
                    <div key={item._id} className="drink-item">
                      {editingItem?._id === item._id ? (
                        // (โหมดแก้ไข Item)
                        <DrinkItemForm 
                          initialData={item}
                          onCancel={() => setEditingItem(null)}
                          onSubmit={(formData) => handleEditItem(cat._id, item._id, formData)}
                        />
                      ) : (
                        // (โหมดแสดงผล Item)
                        <>
                          <span>{item.name} ({item.unit}) - {item.price} ฿</span>
                          <div>
                            <button onClick={() => setEditingItem(item)}>แก้</button>
                            <button onClick={() => handleDeleteItem(cat._id, item._id)}>ลบ</button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* --- ฟอร์มเพิ่ม Item --- */}
                {addingToCategory === cat._id ? (
                  <DrinkItemForm 
                    onCancel={() => setAddingToCategory(null)}
                    onSubmit={(formData) => handleAddItem(cat._id, formData)}
                  />
                ) : (
                  <button className="add-item-btn" onClick={() => setAddingToCategory(cat._id)}>
                    + เพิ่มรายการในหมวดนี้
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'sets' && (
        <div className="sets-view">
          <button className="add-category-btn" onClick={() => { setEditingSet(null); setIsSetModalOpen(true); }}>
            <i className="bi bi-plus-square-fill"></i> เพิ่มเซ็ตใหม่
          </button>
          
          {/* (ส่วนแสดงผล Set .map() ของคุณเหมือนเดิม) */}
          <div className="package-container">
             {sets.map(set => (
               <div key={set._id} className="package">
                 <b>{set.name} ({set.setId})</b>
                 {/* ... (ข้อมูล set) ... */}
                 <button onClick={() => { setEditingSet(set); setIsSetModalOpen(true); }}>แก้ไข</button>
                 <button onClick={() => handleDeleteSet(set._id)}>ลบ</button>
               </div>
             ))}
          </div>
          
          {/* --- 2. (แก้ไข) ลบ TODO ออก และเรียกใช้ Modal ที่นี่ --- */}
          <DrinkSetFormModal 
            open={isSetModalOpen}
            onClose={() => {
              setIsSetModalOpen(false);
              setEditingSet(null); // (เคลียร์ state ตอนปิด)
            }}
            onSubmit={handleSaveSet} // (ใช้ฟังก์ชัน 'save' ที่คุณมีอยู่แล้ว)
            initialData={editingSet} // (ส่ง 'null' (เพิ่ม) หรือ 'set' (แก้ไข) เข้าไป)
          />
          {/* -------------------------------------------------- */}
          
        </div>
      )}
    </div>
  );
}

export default ManageDrinks;