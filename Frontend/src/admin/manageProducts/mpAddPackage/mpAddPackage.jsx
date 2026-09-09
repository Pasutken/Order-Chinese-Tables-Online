import "./MpAddPackage.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import MenuSelectionModal from "./MenuSelectionModal"; // (ต้อง Import Modal มาด้วย)

function MpAddPackage({ url }) {
  const navigate = useNavigate();

  // --- States ทั้งหมด ---
  const [menuItems, setMenuItems] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentTarget, setCurrentTarget] = useState({
    dishIndex: null,
    optionIndex: null,
  });

  // State สำหรับข้อมูลแพ็คเกจใหม่
  const [packageData, setPackageData] = useState({
    name: "",
    dishes: [
      {
        group: [{ menuItem: "" }], // เริ่มต้นด้วย 1 จาน 1 ตัวเลือก
      },
    ],
    category: "", // ID ของหมวดหมู่ที่เลือก
    minPrice: 0,
    maxPrice: 0,
    price: 0
  });

  // --- UseEffects ---

  // Effect สำหรับดึงรายการเมนูทั้งหมด
  useEffect(() => {
    axios
      .get(`${url}/api/mpmenu/getmenus`) // (ใช้ Endpoint ที่ดึงเมนู)
      .then((res) => {
        console.log("Fetched Menu Items:", res.data);
        setMenuItems(res.data);
      })
      .catch((err) => console.log(err));
  }, [url]);

  // Effect สำหรับดึงหมวดหมู่แพ็คเกจ
  useEffect(() => {
    axios
      .get(`${url}/api/mpmain/getpackagecategory`)
      .then((res) => {
        console.log("Fetched Categories:", res.data);
        setAllCategories(res.data);
      })
      .catch((err) => console.log(err));
  }, [url]);

  // Effect สำหรับคำนวณราคาอัตโนมัติ
  useEffect(() => {
    if (menuItems.length === 0) return; // ถ้าเมนูยังไม่โหลด ก็ไม่ต้องคำนวณ

    // สร้าง Map (ตารางค้นหา) เพื่อให้ดึงราคาได้เร็ว
    const priceMap = new Map();
    menuItems.forEach((item) => {
      priceMap.set(item._id, item.price);
    });

    let calculatedMinPrice = 0;
    let calculatedMaxPrice = 0;

    // วนลูปทุก "จาน" (Course)
    for (const dish of packageData.dishes) {
      let minPriceInDish = Infinity;
      let maxPriceInDish = 0;

      // วนลูปทุก "ตัวเลือก" (Option) ในจานนี้
      for (const option of dish.group) {
        if (option.menuItem && priceMap.has(option.menuItem)) {
          const price = priceMap.get(option.menuItem);

          if (price < minPriceInDish) minPriceInDish = price;
          if (price > maxPriceInDish) maxPriceInDish = price;
        }
      } // จบลูปตัวเลือก

      // ถ้า minPriceInDish ไม่ใช่ Infinity (แปลว่าจานนี้ไม่ว่าง)
      if (minPriceInDish !== Infinity) {
        calculatedMinPrice += minPriceInDish;
        calculatedMaxPrice += maxPriceInDish;
      }
    } // จบลูปจาน

    // อัปเดต state
    setPackageData((prevData) => ({
      ...prevData,
      minPrice: calculatedMinPrice,
      maxPrice: calculatedMaxPrice,
    }));
  }, [packageData.dishes, menuItems]); // ทำงานใหม่ทุกครั้งที่เมนูในจานเปลี่ยน หรือ menuItems โหลดเสร็จ

  // --- Handler Functions ---

  // 1. จัดการการเปลี่ยนแปลงของ input (ชื่อ, หมวดหมู่)
  const handlePackageChange = (e) => {
    const { name, value } = e.target;
    setPackageData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // 2. เพิ่มจาน (Course)
  const handleAddDish = () => {
    setPackageData((prevData) => ({
      ...prevData,
      dishes: [...prevData.dishes, { group: [{ menuItem: "" }] }],
    }));
  };

  // 3. ลบจาน (Course)
  const handleRemoveDish = (dishIndex) => {
    if (packageData.dishes.length <= 1) return; // ไม่ให้ลบจานสุดท้าย
    const updatedDishes = packageData.dishes.filter(
      (_, index) => index !== dishIndex
    );
    setPackageData((prevData) => ({
      ...prevData,
      dishes: updatedDishes,
    }));
  };

  // 4. เพิ่มตัวเลือก (Option) ในจาน
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

  // 5. ลบตัวเลือก (Option)
  const handleRemoveOption = (dishIndex, optionIndex) => {
    const updatedDishes = packageData.dishes.map((dish, index) => {
      if (index === dishIndex) {
        if (dish.group.length <= 1) return dish; // ไม่ให้ลบตัวเลือกสุดท้าย
        const updatedGroup = dish.group.filter(
          (_, oIndex) => oIndex !== optionIndex
        );
        return { ...dish, group: updatedGroup };
      }
      return dish;
    });
    setPackageData((prevData) => ({
      ...prevData,
      dishes: updatedDishes,
    }));
  };

  // 6. เปิด Modal
  const openMenuModal = (dishIndex, optionIndex) => {
    setCurrentTarget({ dishIndex, optionIndex });
    setIsModalOpen(true);
  };

  // 7. เมื่อเลือกเมนูจาก Modal
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
    setPackageData((prevData) => ({
      ...prevData,
      dishes: updatedDishes,
    }));
    setIsModalOpen(false);
    setCurrentTarget({ dishIndex: null, optionIndex: null });
  };

  // --- 8. ฟังก์ชัน Submit (พร้อม Validation) ---
  async function handleSubmit(e) {
    // e.preventDefault();
    console.log("ตรวจสอบข้อมูลแพ็คเกจ:", packageData);

    // --- Validation ---
    if (!packageData.name || !packageData.name.trim()) {
      alert("กรุณาตั้งชื่อแพ็คเกจ");
      return;
    }
    if (!packageData.category) {
      alert("กรุณาเลือกหมวดหมู่");
      return;
    }

    if (
      !packageData.minPrice ||
      packageData.minPrice <= 0 ||
      !packageData.maxPrice ||
      packageData.maxPrice <= 0
    ) {
      alert("กรุณาระบุราคาให้ถูกต้อง (ต้องเลือกเมนูอย่างน้อย 1 รายการ)");
      return;
    }

    if(!packageData.price || packageData.price <= 0){
      alert("กรุณาระบุราคาแพ็คเกจ");
      return;
    }

    // ตรวจสอบจานว่าง
    let firstEmptyDishIndex = -1;
    const hasInvalidDish = packageData.dishes.some((dish, index) => {
      const hasEmptyOption = dish.group.some((option) => {
        return !option.menuItem || option.menuItem === "";
      });
      if (hasEmptyOption) {
        firstEmptyDishIndex = index;
        return true;
      }
      return false;
    });
    if (hasInvalidDish) {
      alert(
        `กรุณาเลือกเมนูให้ครบทุกตัวเลือก ในจานที่ ${firstEmptyDishIndex + 1}`
      );
      return;
    }

    // --- ถ้าตรวจสอบผ่านทั้งหมด ---
    console.log("Validation ผ่าน! กำลังส่งข้อมูล...", packageData);

    try {
      // สร้างข้อมูลที่จะส่ง (เปลี่ยนชื่อ key ให้ตรง Schema)
      const finalPackageData = {
        name: packageData.name,
        category: packageData.category,
        dishes: packageData.dishes,
        minprice: packageData.minPrice, // <-- จาก state
        maxprice: packageData.maxPrice, // <-- จาก state
        price: packageData.price,
      };

      const response = await axios.post(
        `${url}/api/mppackage/addpackage`,
        finalPackageData
      );

      console.log("Server response:", response.data);
      alert("เพิ่มแพ็คเกจสำเร็จ!");
      navigate("/menu");
    } catch (err) {
      console.error("Error submitting package:", err);
      alert("เกิดข้อผิดพลาด: " + (err.response?.data?.message || err.message));
    }
  }

  // --- JSX ---
  return (
    <div className="MpAddPackage-container">
      <div className="MpAddPackage-header-container">
        <button onClick={() => navigate("/menu")}>
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
        <div>
          <input
            type="number"
            placeholder="ราคาแพ็คเกจ"
            className="packagePrice"
            name="price"
            value={packageData.price}
            onChange={handlePackageChange}
          />
        </div>


          <div className="calculated-price-display">
            <div>
              ราคาต่ำสุด:{" "}
              <strong>{packageData.minPrice.toLocaleString()}</strong> บาท
            </div>
            <div>
              ราคาสูงสุด:{" "}
              <strong>{packageData.maxPrice.toLocaleString()}</strong> บาท
            </div>
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
              <button onClick={() => handleRemoveDish(dishIndex)}>
                <i className="bi bi-trash3"></i>
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
                  <button
                    onClick={() => handleRemoveOption(dishIndex, optionIndex)}
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                </div>
              );
            })}
          </div>
        ))}
        <button onClick={handleSubmit}>บันทึกแพ็คเกจ</button>
      </div>

      {/* ส่วน Modal */}
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

export default MpAddPackage;
