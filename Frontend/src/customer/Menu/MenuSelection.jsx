import { useEffect, useState, useMemo } from "react";
import "./MenuSelection.css";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const url = "http://localhost:3000";

// กำหนดจำนวนโต๊ะขั้นต่ำตามราคา
const MIN_TABLE_COUNTS_MAP = {
  1200: 20,
  1500: 10,
  1800: 10,
  2000: 10,
  2300: 5,
  2600: 5,
  3000: 5,
  3500: 5,
  4000: 5,
  default: 10,
};

// กำหนดจำนวนรายการ Add-on ต่อหน้า
const ITEMS_PER_PAGE = 8;

const MenuSelection = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ตรวจสอบสถานะการแก้ไข
  const isEditing = location.state?.isEditing || false;
  const existingBooking = location.state?.existingBooking || null;

  // States
  const [menuData, setMenuData] = useState(null);
  const [selectedDishes, setSelectedDishes] = useState({});
  const [drinkSelections, setDrinkSelections] = useState({});
  const [tableCount, setTableCount] = useState(0);
  const [activeDrinkTab, setActiveDrinkTab] = useState("set");
  const [selectedDrinkSet, setSelectedDrinkSet] = useState(null);

  const [allMenuItems, setAllMenuItems] = useState([]);
  const [addonFoodSelections, setAddonFoodSelections] = useState({});
  const [showAddons, setShowAddons] = useState(false);
  const [addonSearchQuery, setAddonSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [drinkSets, setDrinkSets] = useState([]);
  const [drinkCategories, setDrinkCategories] = useState([]);

  // State สำหรับ Toggle ดูรายละเอียดราคารายจาน
  const [showDishPriceDetails, setShowDishPriceDetails] = useState(false);

  const currentMinTableCount = useMemo(() => {
    if (!menuData) return MIN_TABLE_COUNTS_MAP.default;
    return (
      MIN_TABLE_COUNTS_MAP[menuData.maxprice] || MIN_TABLE_COUNTS_MAP.default
    );
  }, [menuData]);

  useEffect(() => {
    if (!packageId) return;

    const fetchData = async () => {
      try {
        const [menuRes, productsRes, setsRes, catsRes] = await Promise.all([
          fetch(`${url}/api/menus/${packageId}`),
          fetch(`${url}/api/products`),
          fetch(`${url}/api/drink-sets`),
          fetch(`${url}/api/drink-categories`),
        ]);

        const menuData = await menuRes.json();
        const productsData = await productsRes.json();
        const setsData = await setsRes.json();
        const catsData = await catsRes.json();

        setMenuData(menuData);
        setAllMenuItems(productsData);
        setDrinkSets(setsData);
        setDrinkCategories(catsData);

        if (isEditing && existingBooking) {
          applyExistingData(
            existingBooking,
            menuData,
            productsData,
            setsData,
            catsData
          );
        } else {
          const minCount =
            MIN_TABLE_COUNTS_MAP[menuData.maxprice] ||
            MIN_TABLE_COUNTS_MAP.default;
          setTableCount(minCount);
          setSelectedDishes({});
          setDrinkSelections({});
          setSelectedDrinkSet(null);
          setAddonFoodSelections({});
        }
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    fetchData();
  }, [packageId, isEditing, existingBooking]);

  const applyExistingData = (booking, menu, products, sets, cats) => {
    const details = booking.details || {};
    if (details.tableCount) setTableCount(details.tableCount);

    if (details.selectedDishes && Array.isArray(details.selectedDishes)) {
      const newSelectedDishes = {};
      details.selectedDishes.forEach((dishItem, rowIndex) => {
        const dishName =
          typeof dishItem === "string" ? dishItem : dishItem.name;
        if (menu.dishes[rowIndex]) {
          const group = menu.dishes[rowIndex].group;
          const foundIndex = group.findIndex(
            (d) => d.menuItem.name === dishName
          );
          if (foundIndex !== -1) {
            newSelectedDishes[rowIndex] = foundIndex;
          }
        }
      });
      setSelectedDishes(newSelectedDishes);
    }

    if (
      details.selectedAddonFoods &&
      Array.isArray(details.selectedAddonFoods)
    ) {
      const newAddons = {};
      details.selectedAddonFoods.forEach((addon) => {
        const foundProduct = products.find((p) => p.name === addon.name);
        if (foundProduct) {
          newAddons[foundProduct._id] = { quantity: addon.quantity };
        }
      });
      setAddonFoodSelections(newAddons);
      if (Object.keys(newAddons).length > 0) setShowAddons(true);
    }

    if (details.selectedDrinkSet) {
      const foundSet = sets.find(
        (s) => s.name === details.selectedDrinkSet.name
      );
      if (foundSet) {
        setSelectedDrinkSet(foundSet);
        setActiveDrinkTab("set");
      }
    }

    if (
      details.selectedDrinks &&
      Array.isArray(details.selectedDrinks) &&
      details.selectedDrinks.length > 0
    ) {
      const newDrinks = {};
      details.selectedDrinks.forEach((drink) => {
        cats.forEach((cat, catIdx) => {
          cat.items.forEach((item, itemIdx) => {
            if (item.name === drink.name) {
              const key = `${catIdx}-${itemIdx}`;
              newDrinks[key] = { quantity: drink.quantity };
            }
          });
        });
      });
      setDrinkSelections(newDrinks);
      if (Object.keys(newDrinks).length > 0) setActiveDrinkTab("individual");
    }
  };

  const handleSelect = (rowIndex, dishIndex) => {
    setSelectedDishes((prev) => ({ ...prev, [rowIndex]: dishIndex }));
  };

  const handleDrinkChange = (categoryIndex, itemIndex, quantity) => {
    const key = `${categoryIndex}-${itemIndex}`;
    const newQuantity = Math.max(0, quantity);
    if (newQuantity === 0) {
      setDrinkSelections((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    } else {
      setDrinkSelections((prev) => ({
        ...prev,
        [key]: { quantity: newQuantity },
      }));
    }
  };

  const handleTableCountAdjust = (amount) => {
    const newCount = Math.max(currentMinTableCount, tableCount + amount);
    setTableCount(newCount);
  };

  const handleTableCountInputChange = (e) => {
    const value = e.target.value;
    const count =
      value === ""
        ? currentMinTableCount
        : Math.max(currentMinTableCount, Number(value));
    setTableCount(count);
  };

  const handleSetSelect = (set) => {
    if (selectedDrinkSet && selectedDrinkSet._id === set._id)
      setSelectedDrinkSet(null);
    else setSelectedDrinkSet(set);
  };

  const handleAddonFoodChange = (itemId, quantity) => {
    const newQuantity = Math.max(0, quantity);
    if (newQuantity === 0) {
      setAddonFoodSelections((prev) => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    } else {
      setAddonFoodSelections((prev) => ({
        ...prev,
        [itemId]: { quantity: newQuantity },
      }));
    }
  };

  const handleAddonSearchQueryChange = (e) => {
    setAddonSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const totalFilteredItems = useMemo(() => {
    const query = addonSearchQuery.toLowerCase().trim();
    return allMenuItems.filter(
      (item) =>
        item.price > 0 &&
        (query === "" || item.name.toLowerCase().includes(query))
    );
  }, [allMenuItems, addonSearchQuery]);

  const paginatedAddonItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return totalFilteredItems.slice(startIndex, endIndex);
  }, [totalFilteredItems, currentPage]);

  const totalAddonPages = useMemo(() => {
    return Math.ceil(totalFilteredItems.length / ITEMS_PER_PAGE);
  }, [totalFilteredItems]);

  const getPriceFromProduct = (menuItemId, defaultPrice) => {
    if (allMenuItems.length > 0) {
      const found = allMenuItems.find((p) => p._id === menuItemId);
      if (found) return found.price;
    }
    return defaultPrice || 0;
  };

  // --- Calculations ---

  const currentPackagePrice = useMemo(() => {
    if (!menuData) return 0;
    return menuData.price;
  }, [menuData]);

  const foodSubtotal = useMemo(() => {
    if (!menuData) return 0;
    return currentPackagePrice * tableCount;
  }, [menuData, currentPackagePrice, tableCount]);

  // Breakdown for Display
  const selectedDishBreakdown = useMemo(() => {
    if (!menuData) return [];

    return Object.entries(selectedDishes)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([rowIndex, dishIndex]) => {
        const group = menuData.dishes[rowIndex];
        if (!group || !group.group[dishIndex]) return null;

        const dishItem = group.group[dishIndex].menuItem;
        const unitPrice = getPriceFromProduct(dishItem._id, dishItem.price);
        const totalItemPrice = unitPrice * tableCount;

        return {
          row: Number(rowIndex) + 1,
          name: dishItem.name,
          unitPrice: unitPrice,
          totalItemPrice: totalItemPrice,
        };
      })
      .filter(Boolean);
  }, [selectedDishes, menuData, tableCount, allMenuItems]);

  const totalDishesValue = useMemo(() => {
    return selectedDishBreakdown.reduce(
      (acc, item) => acc + item.totalItemPrice,
      0
    );
  }, [selectedDishBreakdown]);

  // --- NEW: คำนวณยอดที่ประหยัดได้ ---
  const savedAmount = useMemo(() => {
    return totalDishesValue - foodSubtotal;
  }, [totalDishesValue, foodSubtotal]);
  // ---------------------------------

  const totalDrinkData = useMemo(() => {
    let totalItems = 0;
    let totalPrice = 0;
    Object.entries(drinkSelections).forEach(([key, { quantity }]) => {
      if (quantity > 0 && drinkCategories.length > 0) {
        const [catIdx, itemIdx] = key.split("-").map(Number);
        if (drinkCategories[catIdx]?.items[itemIdx]) {
          const item = drinkCategories[catIdx].items[itemIdx];
          totalItems += quantity;
          totalPrice += item.price * quantity;
        }
      }
    });
    return { totalItems, totalPrice };
  }, [drinkSelections, drinkCategories]);

  const totalDrinkSetPrice = useMemo(() => {
    if (!selectedDrinkSet) return 0;
    return selectedDrinkSet.pricePerTable * tableCount;
  }, [selectedDrinkSet, tableCount]);

  const totalAddonFoodData = useMemo(() => {
    let totalItems = 0;
    let totalPrice = 0;
    Object.entries(addonFoodSelections).forEach(([itemId, { quantity }]) => {
      const item = allMenuItems.find((i) => i._id === itemId);
      if (item && quantity > 0) {
        totalItems += quantity;
        totalPrice += item.price * quantity;
      }
    });
    return { totalItems, totalPrice };
  }, [addonFoodSelections, allMenuItems]);

  const grandTotal = useMemo(() => {
    return (
      foodSubtotal +
      totalAddonFoodData.totalPrice +
      totalDrinkData.totalPrice +
      totalDrinkSetPrice
    );
  }, [
    foodSubtotal,
    totalAddonFoodData.totalPrice,
    totalDrinkData.totalPrice,
    totalDrinkSetPrice,
  ]);

  const isSelectionComplete = useMemo(() => {
    if (!menuData) return false;
    return Object.keys(selectedDishes).length === menuData.dishes.length;
  }, [selectedDishes, menuData]);

  const handleProceedToBooking = () => {
    if (!isSelectionComplete) {
      let firstMissingRow = -1;
      for (let i = 0; i < menuData.dishes.length; i++) {
        if (selectedDishes[i] === undefined) {
          firstMissingRow = i + 1;
          break;
        }
      }
      alert(
        firstMissingRow !== -1
          ? `กรุณาเลือกอาหารจานที่ ${firstMissingRow} ก่อนครับ`
          : "กรุณาเลือกอาหารให้ครบ"
      );
      return;
    }

    const finalDishes = Object.entries(selectedDishes)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([rowIndex, dishIndex]) => {
        const dishItem = menuData.dishes[rowIndex].group[dishIndex].menuItem;
        const realPrice = getPriceFromProduct(dishItem._id, dishItem.price);

        return {
          name: dishItem.name,
          pricePerUnit: realPrice,
          quantity: tableCount,
          totalPrice: realPrice * tableCount,
        };
      });

    const finalDrinks = Object.entries(drinkSelections)
      .filter(([, { quantity }]) => quantity > 0)
      .map(([key, { quantity }]) => {
        const [catIdx, itemIdx] = key.split("-").map(Number);
        const item = drinkCategories[catIdx].items[itemIdx];
        return {
          name: item.name,
          unit: item.unit,
          quantity,
          price: item.price,
          total: item.price * quantity,
        };
      });

    const finalAddonFoods = Object.entries(addonFoodSelections)
      .filter(([, { quantity }]) => quantity > 0)
      .map(([itemId, { quantity }]) => {
        const item = allMenuItems.find((i) => i._id === itemId);
        return {
          name: item.name,
          unit: "จาน",
          quantity,
          price: item.price,
          total: item.price * quantity,
        };
      });

    let priceDifference = 0;
    let originalPrice = 0;

    if (isEditing && existingBooking) {
      originalPrice =
        existingBooking.grandTotal || existingBooking.totalPrice || 0;
      priceDifference = grandTotal - originalPrice;
    }

    const bookingData = {
      packagePrice: currentPackagePrice,
      packageName: menuData.name,
      selectedDishes: finalDishes,
      selectedAddonFoods: finalAddonFoods,
      totalAddonFoodPrice: totalAddonFoodData.totalPrice,
      selectedDrinks: finalDrinks,
      totalDrinkPrice: totalDrinkData.totalPrice,
      selectedDrinkSet: selectedDrinkSet
        ? {
            name: selectedDrinkSet.name,
            pricePerTable: selectedDrinkSet.pricePerTable,
            totalPrice: totalDrinkSetPrice,
          }
        : null,
      tableCount,
      foodSubtotal,
      grandTotal,

      isEditing: isEditing,
      bookingId: existingBooking ? existingBooking._id : null,
      originalPrice: originalPrice,
      priceDifference: priceDifference,
    };

    navigate("/booking", { state: bookingData });
  };

  if (!menuData || tableCount === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "20px",
          fontFamily: "Kanit",
        }}
      >
        ไม่พบข้อมูล...
      </div>
    );
  }

  return (
    <div className="menu-container">
      <h1 className="menu-title">
        {menuData.name} {isEditing ? "(แก้ไขรายการ)" : ""}
      </h1>

      <div className="rows-container">
        {menuData.dishes.map((group, rowIndex) => (
          <div key={rowIndex} className="row-wrapper">
            <div className="row-selection">
              {selectedDishes[rowIndex] !== undefined
                ? group.group[selectedDishes[rowIndex]].menuItem.name
                : `จานที่ ${rowIndex + 1} เลือกได้ 1 รายการ`}
            </div>
            <div className={`row-grid row-grid-${group.group.length}`}>
              {group.group.map((dish, index) => {
                const displayPrice = getPriceFromProduct(
                  dish.menuItem._id,
                  dish.menuItem.price
                );

                return (
                  <div
                    key={`${rowIndex}-${index}`}
                    onClick={() => handleSelect(rowIndex, index)}
                    className={`menu-item ${
                      selectedDishes[rowIndex] === index ? "selected" : ""
                    }`}
                  >
                    {dish.menuItem.imageUrl ? (
                      <img
                        src={`${url}/${dish.menuItem.imageUrl}`}
                        alt={dish.menuItem.name}
                        style={{
                          width: "120px",
                          height: "auto",
                          marginBottom: "5px",
                          borderRadius: "8px",
                        }}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    ) : (
                      <div className="no-image">ไม่มีรูป</div>
                    )}
                    <p className="menu-text">{dish.menuItem.name}</p>
                    <p
                      className="menu-price"
                      style={{ fontSize: "0.8rem", color: "#666" }}
                    >
                      {displayPrice.toLocaleString()} บาท
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <br />
      <br />
      <br />

      <div className="table-count-section">
        <h2 className="table-count-title">
          จำนวนโต๊ะ (ขั้นต่ำ {currentMinTableCount} โต๊ะ)
        </h2>
        <div className="quantity-control table-input-control">
          <button
            onClick={() => handleTableCountAdjust(-1)}
            disabled={tableCount <= currentMinTableCount}
          >
            -
          </button>
          <input
            type="number"
            pattern="\d*"
            className="table-count-input"
            value={tableCount}
            onChange={handleTableCountInputChange}
            min={currentMinTableCount}
          />
          <button onClick={() => handleTableCountAdjust(1)}>+</button>
        </div>
      </div>

      <br />
      <br />
      <br />

      <div className="addon-food-section">
        <div
          className="addon-header"
          onClick={() => setShowAddons(!showAddons)}
        >
          <h2 className="addon-title">
            สั่งอาหารเพิ่ม (Add-on){" "}
            <span>({totalAddonFoodData.totalItems} รายการที่เลือก)</span>
          </h2>
          <button className="toggle-btn">
            {showAddons ? "ซ่อน" : "แสดง"}
          </button>
        </div>
        {showAddons && (
          <div className="addon-food-content">
            <input
              type="text"
              placeholder="ค้นหาชื่อเมนู..."
              className="addon-search-input"
              value={addonSearchQuery}
              onChange={handleAddonSearchQueryChange}
            />
            <div
              className="search-result-info"
              style={{ marginBottom: "10px", fontSize: "0.9rem" }}
            >
              {addonSearchQuery.trim() !== ""
                ? `พบ ${totalFilteredItems.length} รายการ`
                : `มีรายการ Add-on ทั้งหมด ${totalFilteredItems.length} รายการ`}
            </div>

            <div className="addon-food-grid">
              {paginatedAddonItems.length > 0 ? (
                paginatedAddonItems.map((item) => {
                  const qty = addonFoodSelections[item._id]?.quantity || 0;
                  return (
                    <div key={item._id} className="drink-card addon-card">
                      {item.imageUrl && (
                        <img
                          src={`${url}/${item.imageUrl}`}
                          alt={item.name}
                          className="addon-image"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      )}
                      <div className="drink-header">
                        <div className="addon-name">{item.name}</div>
                        <span className="drink-price">
                          {item.price.toLocaleString()} บาท/จาน
                        </span>
                      </div>
                      <div className="drink-controls">
                        <div className="quantity-control">
                          <button
                            onClick={() =>
                              handleAddonFoodChange(item._id, qty - 1)
                            }
                            disabled={qty <= 0}
                          >
                            −
                          </button>
                          <span className="quantity-display">{qty}</span>
                          <button
                            onClick={() =>
                              handleAddonFoodChange(item._id, qty + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-addons">
                  ไม่พบรายการอาหาร Add-on ที่ค้นหา
                </div>
              )}
            </div>

            {totalAddonPages > 1 && (
              <div className="pagination-controls">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &lt; ก่อนหน้า
                </button>
                {[...Array(totalAddonPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={currentPage === index + 1 ? "active-page" : ""}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalAddonPages}
                >
                  ถัดไป &gt;
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <br />
      <br />
      <br />

      <div className="drink-section">
        <h2 className="drink-title">เครื่องดื่ม</h2>
        <div className="drink-tab-switcher">
          <button
            className={`tab-btn ${activeDrinkTab === "set" ? "active" : ""}`}
            onClick={() => setActiveDrinkTab("set")}
          >
            เลือกเป็นเซ็ต (ต่อโต๊ะ)
          </button>
          <button
            className={`tab-btn ${
              activeDrinkTab === "individual" ? "active" : ""
            }`}
            onClick={() => setActiveDrinkTab("individual")}
          >
            เลือกเครื่องดื่มเอง
          </button>
        </div>

        {activeDrinkTab === "set" && (
          <div className="drink-set-list">
            {drinkSets.map((set) => (
              <div
                key={set._id}
                className={`drink-set-card ${
                  selectedDrinkSet?._id === set._id ? "selected" : ""
                }`}
                onClick={() => handleSetSelect(set)}
              >
                <h4 className="set-name">{set.name || ""}</h4>
                <p className="set-description">{set.description || ""}</p>
                <span className="set-price">
                  {set.pricePerTable.toLocaleString()} บาท / โต๊ะ
                </span>
              </div>
            ))}
          </div>
        )}

        {activeDrinkTab === "individual" && (
          <div className="drink-individual-list">
            {drinkCategories.map((category, catIdx) => (
              <div key={category._id} className="drink-category">
                <h3 className="drink-category-title">{category.name}</h3>
                <div className="drink-items">
                  {category.items.map((item, itemIdx) => {
                    const key = `${catIdx}-${itemIdx}`;
                    const qty = drinkSelections[key]?.quantity || 0;
                    return (
                      <div key={item._id} className="drink-card">
                        <div className="drink-header">
                          {item.name}{" "}
                          <span className="drink-price">
                            {item.price} บาท/{item.unit}
                          </span>
                        </div>
                        <div className="drink-controls">
                          <div className="quantity-control">
                            <button
                              onClick={() =>
                                handleDrinkChange(catIdx, itemIdx, qty - 1)
                              }
                              disabled={qty <= 0}
                            >
                              -
                            </button>
                            <span className="quantity-display">{qty}</span>
                            <button
                              onClick={() =>
                                handleDrinkChange(catIdx, itemIdx, qty + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <br />
      <br />
      <br />

      {/* สรุปยอดรวม */}
      <div className="grand-total-summary">
        <h3>สรุปยอดรวม</h3>

        {/* --- ส่วนแสดงรายละเอียดราคาอาหารและยอดที่ประหยัดได้ --- */}
        <div
          style={{
            marginBottom: "15px",
            borderBottom: "1px dashed #ccc",
            paddingBottom: "10px",
          }}
        >
          <div
            onClick={() => setShowDishPriceDetails(!showDishPriceDetails)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              cursor: "pointer",
              color: "#000000ff",
              fontSize: "0.9rem",
              fontWeight: "500",
              userSelect: "none",
            }}
          >
            <span>
              {showDishPriceDetails
                ? "ซ่อนรายละเอียดราคาอาหาร"
                : "ดูรายละเอียดมูลค่าอาหารที่เลือก"}
            </span>
            <span>{showDishPriceDetails ? "▲" : "▼"}</span>
          </div>

          {showDishPriceDetails && (
            <div
              className="dish-price-details"
              style={{
                marginTop: "10px",
                backgroundColor: "#f8f9fa",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#d9534f",
                  marginBottom: "8px",
                  fontStyle: "italic",
                }}
              >
                * ราคาด้านล่างคือมูลค่าอาหารจริง (ไม่นำไปคำนวณยอดรวม
                เพราะคิดแบบเหมาจ่าย)
              </p>
              {selectedDishBreakdown.map((item) => (
                <div
                  key={item.row}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.85rem",
                    marginBottom: "4px",
                  }}
                >
                  <span style={{ flex: 1 }}>
                    {item.row}. {item.name}
                  </span>
                  <span style={{ color: "#555" }}>
                    {item.totalItemPrice.toLocaleString()} บ.
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "#999",
                        marginLeft: "5px",
                      }}
                    >
                      ({item.unitPrice.toLocaleString()})
                    </span>
                  </span>
                </div>
              ))}

              <div
                style={{
                  borderTop: "1px solid #ddd",
                  marginTop: "8px",
                  paddingTop: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.9rem",
                    color: "#444",
                    marginBottom: "4px",
                  }}
                >
                  <span>มูลค่ารวมจริง</span>
                  <span>{totalDishesValue.toLocaleString()} บาท</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.9rem",
                    color: "#444",
                    marginBottom: "6px",
                  }}
                >
                  <span>เหมาจ่าย (Package)</span>
                  <span>{foodSubtotal.toLocaleString()} บาท</span>
                </div>

                {/* ส่วนแสดงยอดที่ประหยัดได้ */}
                {savedAmount > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "1rem",
                      color: "#28a745", // สีเขียว
                      fontWeight: "bold",
                      backgroundColor: "#d4edda",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      marginTop: "5px",
                    }}
                  >
                    <span>คุณประหยัดได้</span>
                    <span>-{savedAmount.toLocaleString()} บาท</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* --- จบส่วนที่เพิ่มใหม่ --- */}

        <div className="summary-row">
          <span>ค่าอาหารหลัก ({tableCount} โต๊ะ)</span>
          <span>{foodSubtotal.toLocaleString()} บาท</span>
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "#666",
            textAlign: "right",
            marginBottom: "10px",
          }}
        >
          (คำนวณจากราคาแพ็คเกจ {currentPackagePrice?.toLocaleString()} บาท/โต๊ะ
          x จำนวนโต๊ะ)
        </div>

        <div className="summary-row">
          <span>ค่าอาหารเพิ่ม ({totalAddonFoodData.totalItems} รายการ)</span>
          <span>{totalAddonFoodData.totalPrice.toLocaleString()} บาท</span>
        </div>
        {selectedDrinkSet && (
          <div className="summary-row">
            <span>ค่าเซ็ตเครื่องดื่ม</span>
            <span>{totalDrinkSetPrice.toLocaleString()} บาท</span>
          </div>
        )}
        <div className="summary-row">
          <span>ค่าเครื่องดื่มเพิ่ม ({totalDrinkData.totalItems} รายการ)</span>
          <span>{totalDrinkData.totalPrice.toLocaleString()} บาท</span>
        </div>
        <div className="summary-divider"></div>
        <div className="summary-row total">
          <span>ยอดรวมทั้งสิ้น</span>
          <span>{grandTotal.toLocaleString()} บาท</span>
        </div>
      </div>

      <div className="booking-button-container">
        <button
          className="proceed-to-booking-btn"
          onClick={handleProceedToBooking}
          disabled={!isSelectionComplete}
        >
          {isEditing ? "บันทึกการเปลี่ยนแปลง" : "ยืนยันและสรุปยอด"}
        </button>
      </div>
    </div>
  );
};

export default MenuSelection;