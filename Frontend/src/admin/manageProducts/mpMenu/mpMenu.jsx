import "./mpMenu.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
function MpMenu({ url }) {
  const navigate = useNavigate();
  const [currentCategory, setCurrentCategory] = useState(null);

  useEffect(() => {
    axios
      .get(`${url}/api/mpmenu/getmenus`)
      .then((res) => {
        console.log(res.data);
        setData(res.data);
      })
      .catch((err) => {
        console.error("API Error", err);
      });

    axios
      .get(`${url}/api/mpmenu/getmenucategory`)
      .then((res) => {
        setCategoryMenu(res.data);
        setCurrentCategory(res.data[0]._id);
        console.log(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const [data, setData] = useState([]);
  const [categoryMenu, setCategoryMenu] = useState([]);
  const [editingItem, setEditingItem] = useState(null); // null = ปิด, object = เปิด
  const [addItem, setAddItem] = useState(false);
  const initialFormState = {
    name: "",
    price: "",
    pic: "",
    description: "",
    category: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  const handleEditClick = (item) => {
    setEditingItem(item); // เก็บ item ต้นฉบับ (เพื่อเอา id ไปอ้างอิงตอน save)
    setFormData({
      name: item.name,
      price: item.price,
      description: item.description, // <-- นี่คือจุดที่แก้ (จาก item.description ไป formData.des)
      category: item.category,
      pic: item.imageUrl, // <-- (สำคัญ!) แก้ pic เป็น imageUrl ด้วย
      _id: item._id, // (เก็บ _id ไว้ด้วย)
    });
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const handleFormChange = (e) => {
    // 1. เช็กว่าเป็น input 'file' หรือไม่
    if (e.target.type === "file") {
      setSelectedFile(e.target.files[0]); // เก็บ File Object ไว้ใน state
    } else {
      // 2. ถ้าเป็น input 'text' หรือ 'number' ก็ทำงานเหมือนเดิม
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setFormData(initialFormState);
    setSelectedFile(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // 4.1 สร้าง FormData
    const data = new FormData();

    // 4.2 ใส่ข้อมูล Text (ต้องตรงกับ req.body ใน Backend)
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("description", formData.description);
    data.append("category", formData.category);

    // 4.3 เช็กว่ามีการอัปโหลดไฟล์ใหม่หรือไม่
    if (selectedFile) {
      // 4.3.1 ถ้ามี: ใส่ไฟล์ (key 'imageFile' ต้องตรงกับ upload.single)
      data.append("imageFile", selectedFile);
    } else {
      // 4.3.2 ถ้าไม่มี: ส่ง URL เก่า (จาก state) กลับไป
      data.append("pic", formData.pic);
    }

    try {
      // 4.4 ยิง 'axios.put' (เราใช้ 'api' ที่มี baseURL)
      // 'editingItem._id' คือ id จาก MongoDB
      const response = await axios.put(
        `${url}/api/mpmenu/editmenus/${editingItem._id}`,
        data // ส่ง FormData ไปทั้งก้อน (axios ตั้ง header ให้อัตโนมัติ)
      );
      setData((prev) =>
        prev.map((item) =>
          // ถ้า item นี้คือตัวที่เพิ่งแก้ ให้แทนที่ด้วยข้อมูลใหม่ (response.data)
          item._id === editingItem._id ? response.data : item
        )
      );
      handleCloseModal(); // ปิด Popup
      setSelectedFile(null);
    } catch (err) {
      console.error("Error updating menu:", err);
    }
  };

  async function handleDeleteClick(item) {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบเมนูนี้?")) {
      return; // ถ้ากดยกเลิก ก็ไม่ทำอะไร
    }
    try {
      await axios.delete(`${url}/api/mpmenu/deletemenu/${item._id}`);
      setData((prevMenuData) =>
        prevMenuData.filter((menuItem) => menuItem._id !== item._id)
      );
    } catch (err) {
      console.error("Error deleting menu:", err);
    }
  }

  function handleAddOpen() {
    setAddItem(true);
    setFormData(initialFormState);
  }
  function handleAddClose() {
    setAddItem(false);
  }

  const handleAddMenu = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("description", formData.description);
    data.append("category", formData.category);

    if (selectedFile) {
      data.append("imageFile", selectedFile);
    } else {
      return alert("กรุณาใส่รูปภาพ");
    }

    try {
      const response = await axios.post(`${url}/api/mpmenu/addmenus`, data);

      setData((prev) => [...prev, response.data]);

      // --- 👇 3. แก้ไขฟังก์ชันปิด Modal ---
      handleAddClose(); // (ต้องปิด Modal 'Add' ไม่ใช่ 'Edit')
      setSelectedFile(null); // (แนะนำ) เคลียร์ไฟล์ที่เลือก
    } catch (err) {
      console.error("Error adding menu:", err);
      return alert(err.response.data.message)
    }
  };

  function loadMenu(id) {
    setCurrentCategory(id);
  }

  return (
    <div className="mpMenu-container">
      <div className="mpMenu-header">
        <button onClick={() => navigate("/menu")} className="mpback">
          <i className="bi bi-arrow-left-square-fill"></i>
        </button>
        <button className="addMenu-btn" onClick={() => handleAddOpen()}>
          <i className="bi bi-plus-square-fill"></i>เพิ่มเมนูใหม่
        </button>
      </div>
      {/*----------- แสดงข้อมูลเมนูทั้งหมด ------------*/}

      <div className="menulist-container">
        <div className="mpMenu-sidebar">
          {categoryMenu.map((item) => (
            <li
              key={item._id}
              onClick={() => loadMenu(item._id)}
              className={currentCategory === item._id ? "active" : ""}
            >
              {item.categoryMenu}
            </li>
          ))}

          <li
            key="no-category"
            onClick={() => loadMenu(null)}
            className={currentCategory === null ? "active" : ""}
          >
            ไม่มีหมวดหมู่
          </li>
        </div>

        <div className="mpmenu-container">
          {data
            .filter((item) => {
              // --- (แก้ไข) เพิ่ม Logic นี้ ---
              if (currentCategory === null) {
                // ถ้า "ไม่มีหมวดหมู่" (null) ถูกเลือก
                // ให้โชว์ item ที่ category เป็น null, undefined, หรือ "" (ค่าว่าง)
                return !item.category;
              }
              // ถ้าหมวดหมู่ปกติถูกเลือก
              return item.category === currentCategory;
            }) // <-- 1. กรองก่อน
            .map(
              (
                filteredItem // <-- 2. ค่อย map ผลลัพธ์ที่กรองแล้ว
              ) => (
                <div key={filteredItem._id} className="menuItem-container">
                  <div className="itemIn-continer">
                    <img
                      src={`${url}/${filteredItem.imageUrl}`}
                      alt={filteredItem.name}
                    />
                    <b>{filteredItem.name}</b>
                    {filteredItem.description}
                    <b>{`${filteredItem.price} ฿`}</b>
                    <div className="menuItem-btn">
                      <button
                        className="mp-edit-btn"
                        onClick={() => handleEditClick(filteredItem)}
                      >
                        แก้ไข
                      </button>
                      <button
                        className="mp-delete-btn"
                        onClick={() => handleDeleteClick(filteredItem)}
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
        </div>
      </div>

      {editingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>แก้ไขเมนู: {editingItem.name}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>ชื่อเมนู</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>ราคา</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>คำอธิบาย</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  placeholder="คำอธิบายเกี่ยวกับเมนู"
                  onChange={handleFormChange}
                />
              </div>
              <select
                onChange={handleFormChange}
                name="category"
                value={formData.category}
              >
                <option value="" disabled selected></option>
                {categoryMenu.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.categoryMenu}
                  </option>
                ))}
              </select>

              <div className="form-group">
                <label>ลิงก์รูปภาพ (URL)</label>
                <input
                  type="file" // 1. เปลี่ยน type
                  name="picFile" // 2. เปลี่ยน name (เพื่อไม่ให้สับสนกับ state 'pic' ที่เป็น string)
                  onChange={handleFormChange} // 3. ใช้ฟังก์ชันเดิมได้ แต่เราจะแก้ข้างล่าง
                />
              </div>
              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-cancel"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn-save">
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>เพิ่มเมนูใหม่: {}</h2>
            <form onSubmit={handleAddMenu}>
              <div className="form-group">
                <label>ชื่อเมนู</label>
                <input
                  type="text"
                  name="name"
                  placeholder="ใส่ชื่อเมนู"
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>ราคา</label>
                <input
                  type="number"
                  name="price"
                  placeholder="ใส่จำนวนเงิน"
                  onChange={handleFormChange}
                />
                <label>คำอธิบาย</label>
                <input
                  type="text"
                  name="description"
                  placeholder="เพิ่มคำอธิบายเกี่ยวกับเมนู"
                  onChange={handleFormChange}
                />
                <select onChange={handleFormChange} name="category">
                  <option value="" disabled selected>
                    -- กรุณาเลือกหมวดหมู่ --
                  </option>
                  {categoryMenu.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.categoryMenu}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>ลิงก์รูปภาพ (URL)</label>
                <input
                  type="file" // 1. เปลี่ยน type
                  name="picFile" // 2. เปลี่ยน name (เพื่อไม่ให้สับสนกับ state 'pic' ที่เป็น string)
                  onChange={handleFormChange} // 3. ใช้ฟังก์ชันเดิมได้ แต่เราจะแก้ข้างล่าง
                />
              </div>
              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={handleAddClose}
                  className="btn-cancel"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn-save">
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MpMenu;