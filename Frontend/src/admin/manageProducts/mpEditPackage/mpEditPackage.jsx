import "./mpEditPackage.css";
import "../mpAddPackage/mpAddPackage.css"; // (ใช้ CSS จากหน้า Add)
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import MenuSelectionModal from "../mpAddPackage/MenuSelectionModal";

function MpEditPackage({ url }) {
  const navigate = useNavigate();
  const { packageId } = useParams();

  // --- States ---
  const [menuItems, setMenuItems] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- States สำหรับ Dirty Check ---
  const [isDirty, setIsDirty] = useState(false); // ติดตามว่ามีการแก้ไขหรือไม่
  const [originalPackageData, setOriginalPackageData] = useState(null); // เก็บข้อมูลต้นฉบับ

  const [currentTarget, setCurrentTarget] = useState({
    dishIndex: null,
    optionIndex: null,
  });

  const [packageData, setPackageData] = useState({
    name: "",
    dishes: [{ group: [{ menuItem: "" }] }],
    category: "",
    minPrice: 0,
    maxPrice: 0,
    price: 0
  });

  // --- UseEffects ---

  // Effect ดึงเมนู
  useEffect(() => {
    axios
      .get(`${url}/api/mpmenu/getmenus`) // (ตรวจสอบ Endpoint นี้)
      .then((res) => setMenuItems(res.data))
      .catch((err) => console.log(err));
  }, [url]);

  // Effect ดึงหมวดหมู่
  useEffect(() => {
    axios
      .get(`${url}/api/mpmain/getpackagecategory`)
      .then((res) => setAllCategories(res.data))
      .catch((err) => console.log(err));
  }, [url]);

  // Effect ดึงข้อมูลแพ็คเกจ (สำหรับแก้ไข)
  useEffect(() => {
    if (!packageId) return;
    axios
      .get(`${url}/api/mppackage/getonepackage/${packageId}`)
      .then((res) => {
        const fetchedData = {
          ...res.data,
          minPrice: res.data.minprice,
          maxPrice: res.data.maxprice,
        };
        setPackageData(fetchedData);
        // เก็บข้อมูลต้นฉบับ (แบบ Deep Copy)
        setOriginalPackageData(JSON.parse(JSON.stringify(fetchedData)));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching package data:", err);
        alert("ไม่พบข้อมูลแพ็คเกจ");
        setIsLoading(false);
      });
  }, [url, packageId]);

  // Effect คำนวณราคาอัตโนมัติ
  useEffect(() => {
    // ยังไม่โหลดเมนู หรือยังโหลดข้อมูลแพ็คเกจไม่เสร็จ ให้ข้ามไป
    if (menuItems.length === 0 || isLoading) return; 

    const priceMap = new Map();
    menuItems.forEach(item => priceMap.set(item._id, item.price));

    let calculatedMinPrice = 0;
    let calculatedMaxPrice = 0;

    for (const dish of packageData.dishes) {
      let minPriceInDish = Infinity;
      let maxPriceInDish = 0;
      for (const option of dish.group) {
        if (option.menuItem && priceMap.has(option.menuItem)) {
          const price = priceMap.get(option.menuItem);
          if (price < minPriceInDish) minPriceInDish = price;
          if (price > maxPriceInDish) maxPriceInDish = price;
        }
      }
      if (minPriceInDish !== Infinity) {
        calculatedMinPrice += minPriceInDish;
        calculatedMaxPrice += maxPriceInDish;
      }
    }
    
    setPackageData(prevData => ({
      ...prevData,
      minPrice: calculatedMinPrice,
      maxPrice: calculatedMaxPrice,
    }));
  }, [packageData.dishes, menuItems, isLoading]); // ทำงานเมื่อ 3 ค่านี้เปลี่ยน


  // Effect ตรวจจับการเปลี่ยนแปลง (Dirty Check)
  useEffect(() => {
    if (isLoading || !originalPackageData) {
      return;
    }
    const currentDataStr = JSON.stringify(packageData);
    const originalDataStr = JSON.stringify(originalPackageData);

    if (currentDataStr !== originalDataStr) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [packageData, originalPackageData, isLoading]);


  // Effect ดักจับการปิดแท็บ/ปิดเบราว์เซอร์
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = "คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก คุณแน่ใจหรือไม่ว่าต้องการออกจากหน้านี้?";
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);


  // --- Handler Functions ---
  const handlePackageChange = (e) => {
    const { name, value } = e.target;
    setPackageData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleAddDish = () => {
    setPackageData((prevData) => ({
      ...prevData,
      dishes: [...prevData.dishes, { group: [{ menuItem: "" }] }],
    }));
  };
  const handleRemoveDish = (dishIndex) => {
    if (packageData.dishes.length <= 1) return;
    const updatedDishes = packageData.dishes.filter(
      (_, index) => index !== dishIndex
    );
    setPackageData((prevData) => ({ ...prevData, dishes: updatedDishes }));
  };
  // const handleAddOption = (dishIndex) => {
  //   const updatedDishes = packageData.dishes.map((dish, index) => {
  //     if (index === dishIndex) {
  //       return { ...dish, group: [...dish.group, { menuItem: "" }] };
  //     }
  //     return dish;
  //   });
  //   setPackageData((prevData) => ({ ...prevData, dishes: updatedDishes }));
  // };

  const handleAddOption = (dishIndex) => {
    const updatedDishes = packageData.dishes.map((dish, index) => {
      console.log(index, dishIndex);
      if (index === dishIndex) {
        if (dish.group.length >= 4) {
          alert("เพิ่มได้สูงสุด 3 ตัวเลือกเท่านั้น"); // (ออปชันเสริม) แจ้งเตือนผู้ใช้
          return dish; // ส่งค่าเดิมกลับไป ไม่มีการเปลี่ยนแปลง
        }
        return {
          ...dish,
          group: [...dish.group, { menuItem: "" }],
        };
      }
      return dish;
    });
    setPackageData((prevData) => ({
      ...prevData,
      dishes: updatedDishes,
    }));
  };

  const handleRemoveOption = (dishIndex, optionIndex) => {
    const updatedDishes = packageData.dishes.map((dish, index) => {
      if (index === dishIndex) {
        if (dish.group.length <= 1) return dish;
        const updatedGroup = dish.group.filter(
          (_, oIndex) => oIndex !== optionIndex
        );
        return { ...dish, group: updatedGroup };
      }
      return dish;
    });
    setPackageData((prevData) => ({ ...prevData, dishes: updatedDishes }));
  };
  const openMenuModal = (dishIndex, optionIndex) => {
    setCurrentTarget({ dishIndex, optionIndex });
    setIsModalOpen(true);
  };
  const handleMenuSelect = (selectedMenuId) => {
    const { dishIndex, optionIndex } = currentTarget;
    const updatedDishes = packageData.dishes.map((dish, dIndex) => {
      if (dIndex === dishIndex) {
        const updatedGroup = dish.group.map((option, oIndex) => {
          if (oIndex === optionIndex) {
            return { ...option, menuItem: selectedMenuId };
          }
          return option;
        });
        return { ...dish, group: updatedGroup };
      }
      return dish;
    });
    setPackageData((prevData) => ({ ...prevData, dishes: updatedDishes }));
    setIsModalOpen(false);
    setCurrentTarget({ dishIndex: null, optionIndex: null });
  };

  // --- Submit และ Navigate ---
  async function handleSubmit(e) {
    // (Validation)
    if (!packageData.name || !packageData.name.trim()) {
      alert("กรุณาตั้งชื่อแพ็คเกจ"); return;
    }
    if (!packageData.category) {
      alert("กรุณาเลือกหมวดหมู่"); return;
    }
    if (!packageData.minPrice || packageData.minPrice <= 0 || !packageData.maxPrice || packageData.maxPrice <= 0) {
      alert("กรุณาระบุราคาให้ถูกต้อง (ต้องเลือกเมนูอย่างน้อย 1 รายการ)"); return;
    }
    let firstEmptyDishIndex = -1;
    const hasInvalidDish = packageData.dishes.some((dish, index) => {
      const hasEmptyOption = dish.group.some(option => !option.menuItem || option.menuItem === "");
      if (hasEmptyOption) {
        firstEmptyDishIndex = index; return true;
      }
      return false;
    });
    if (hasInvalidDish) {
      alert(`กรุณาเลือกเมนูให้ครบทุกตัวเลือก ในจานที่ ${firstEmptyDishIndex + 1}`); return;
    }
    
    console.log("Validation ผ่าน! กำลังอัปเดตข้อมูล...", packageData);

    try {
      const finalPackageData = {
        name: packageData.name,
        category: packageData.category,
        dishes: packageData.dishes,
        minprice: packageData.minPrice,
        maxprice: packageData.maxPrice,
        price: packageData.price
      };
      
      const response = await axios.put(`${url}/api/mppackage/editpackage/${packageId}`, finalPackageData);

      console.log("Server response:", response.data);
      alert("อัปเดตแพ็คเกจสำเร็จ!");
      
      // บันทึกสำเร็จแล้ว ตั้งค่าว่าไม่มีการแก้ไข
      setIsDirty(false);
      setOriginalPackageData(JSON.parse(JSON.stringify(packageData)));

      // navigate("/"); 

    } catch (err) {
      console.error("Error updating package:", err);
      alert("เกิดข้อผิดพลาด: " + (err.response?.data?.message || err.message));
    }
  }

  // ฟังก์ชันสำหรับปุ่มย้อนกลับ (เช็ก Dirty)
  const handleNavigateBack = () => {
    if (isDirty) {
      if (window.confirm("คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก คุณแน่ใจหรือไม่ว่าต้องการออกจากหน้านี้?")) {
        navigate("/menu");
      }
    } else {
      navigate("/menu");
    }
  };


  // --- JSX ---
  if (isLoading) {
    return <div className="loading-container">กำลังโหลดข้อมูลแพ็คเกจ...</div>
  }

  return (
    <div className="MpAddPackage-container">
      <div className="MpAddPackage-header-container">
        <button onClick={handleNavigateBack}>
          <i className="bi bi-arrow-left-square-fill"></i>
        </button>
        <span className="package-select">
          <p>หมวดหมู่</p>
          <select
            name="category"
            value={packageData.category}
            onChange={handlePackageChange}
          >
            <option value="" disabled>
              กรุณาระบุหมวดหมู่
            </option>
            {allCategories.map((item) => (
              <option key={item._id} value={item._id}>
                {item.categoryName}
              </option>
            ))}
          </select>
        </span>
      </div>

      <div className="createMenu-container">
        <div className="addAndbtndish">
          <input
            type="text"
            placeholder="ตั้งชื่อแพ็คเกจ"
            className="packageName"
            name="name"
            value={packageData.name}
            onChange={handlePackageChange}
          />

          <input
            type="number"
            placeholder="ราคาแพ็คเกจ"
            className="packageName"
            name="price"
            value={packageData.price}
            onChange={handlePackageChange}
          />
          <div className="calculated-price-display">
            <span>
              ราคาต่ำสุด: <strong>{packageData.minPrice.toLocaleString()}</strong> บาท
            </span>
            <span>
              ราคาสูงสุด: <strong>{packageData.maxPrice.toLocaleString()}</strong> บาท
            </span>
          </div>
          <button onClick={handleAddDish} className="">
            <i className="bi bi-plus-square-fill"></i>เพิ่มจำนวนจาน
          </button>
        </div>

        {packageData.dishes.map((dish, dishIndex) => (
          <div key={dishIndex} className="dish-course-container">
            <div className="dish-header">
              <label>จานที่: {dishIndex + 1}</label>
              <button
                onClick={() => handleAddOption(dishIndex)}
                disabled={dish.group.length >= 4} // ปิดปุ่มถ้ามีครบ 3 หรือมากกว่า
                style={{
                  opacity: dish.group.length >= 4 ? 0.5 : 1,
                  cursor: dish.group.length >= 4 ? "not-allowed" : "pointer",
                }} // (ออปชันเสริม) แต่ง CSS ให้รู้ว่ากดไม่ได้
              >
                เพิ่มตัวเลือก ({dish.group.length}/4)
              </button>
            </div>
            {dish.group.map((option, optionIndex) => {
              const selectedMenuItem = menuItems.find(
                (item) => item._id === option.menuItem
              );
              const displayName = selectedMenuItem
                ? selectedMenuItem.name
                : "--- กรุณาเลือกเมนู ---";
              return (
                <div key={optionIndex} className="option-item-container">
                  <button
                    type="button"
                    className="menu-select-button"
                    onClick={() => openMenuModal(dishIndex, optionIndex)}
                  >
                    {displayName}
                  </button>
                  <button onClick={() => handleRemoveOption(dishIndex, optionIndex)}>
                    <i className="bi bi-x-circle"></i>
                  </button>
                </div>
              );
            })}
          </div>
        ))}
        <button onClick={handleSubmit}>บันทึกการแก้ไข</button>
      </div>
      
      {isModalOpen && (
        <MenuSelectionModal
          menuItems={menuItems}
          onSelect={handleMenuSelect}
          onClose={() => setIsModalOpen(false)}
          url={url}
        />
      )}
    </div>
  );
}

export default MpEditPackage;