import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./UserProfile.css";
import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiEdit2,
  FiLogOut,
  FiShoppingBag,
  FiSave,
  FiX,
  FiArrowLeft,
} from "react-icons/fi";
import { useAuth } from "../../authentication/AuthContext";

// (ฟังก์ชัน fetch แบบย่อ)
const apiFetch = async (url, config) => {
  const response = await fetch(url, config);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "เกิดข้อผิดพลาด");
  }
  return response.json();
};

// (ฟังก์ชัน formatAddress... เหมือนเดิม)
const formatAddress = (address) => {
  if (!address) return "ไม่ได้ระบุที่อยู่";
  const parts = [
    address.houseNoMoo,
    address.soi ? `ซอย ${address.soi}` : null,
    address.street ? `ถนน ${address.street}` : null,
    address.subDistrict ? `ต/แขวง ${address.subDistrict}` : null,
    address.district ? `อ/เขต ${address.district}` : null,
    address.province ? `จ. ${address.province}` : null,
    address.zipCode,
  ];
  return parts.filter(Boolean).join(", ");
};

// ฟังก์ชันจัดรูปแบบที่อยู่สำหรับ 'details' (ใน UserProfile)
const formatUserDetailsAddress = (details) => {
  if (!details) return "ยังไม่ได้ระบุที่อยู่";
  const parts = [
    details.address,
    details.city ? `อ/เขต ${details.city}` : null,
    details.province ? `จ. ${details.province}` : null,
    details.zipcode,
  ];
  const a = parts.filter(Boolean).join(", ");
  return a.length > 0 ? a : "ยังไม่ได้ระบุที่อยู่";
};

const UserProfile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const token = localStorage.getItem("token");
  const [editForm, setEditForm] = useState({
    username: "",
    phone: "",
    details: { address: "", city: "", province: "", zipcode: "" },
  });
  const config = {
    headers: {
      // 'Authorization' คือ key, `Bearer ${token}` คือ value
      Authorization: `Bearer ${token}`,
    },
  };

  // --- VVV 2. แก้ไข useEffect ให้ดึงข้อมูลแบบ Public VVV ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await apiFetch(
          `http://localhost:3000/api/users/username`,
          config
        );
        setUser(userData);
        console.log(userData.name)
        setEditForm({
          username: userData.username,
          lastname: userData.lastname,
          phone: userData.phone,
          details: userData.details || {
            address: "",
            city: "",
            province: "",
            zipcode: "",
          },
        });

        // (เรียก API จอง หลังจากได้ ID ผู้ใช้)
        fetchBookings(userData._id);
      } catch (error) {
        console.error("ไม่สามารถดึงข้อมูลผู้ใช้:", error);
        setLoading(false);
      }
    };

    const fetchBookings = async () => {
      const token = localStorage.getItem("token");

      // 2. (สำคัญ!) สร้าง config object สำหรับใส่ headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      try {
        const bookingsData = await apiFetch(
          `http://localhost:3000/api/my-bookings`,
          config
        );
        setBookings(bookingsData || []);
        console.log(bookingsData)
      } catch (error) {
        console.error("ไม่สามารถดึงข้อมูลการจอง:", error);
      }
    };

    fetchUserData().then(() => {
      setLoading(false);
    });
  }, [navigate]);
  // --- ^^^ สิ้นสุด useEffect ^^^ ---

  const handleGoBack = () => {
    navigate("/");
  };
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (
      name === "address" ||
      name === "city" ||
      name === "province" ||
      name === "zipcode"
    ) {
      setEditForm((prev) => ({
        ...prev,
        details: { ...prev.details, [name]: value },
      }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // --- VVV 3. แก้ไข handleSave ให้ส่ง API แบบ Public VVV ---
  const handleSave = async () => {
    try {
      const config = {
        method: "PUT",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }, // <--- [เพิ่ม] ส่ง Token ไปด้วยตอน Save
        body: JSON.stringify(editForm),
      };

      const updatedUser = await apiFetch(
        `http://localhost:3000/api/users/id/${user._id}`,
        config
      );

      setUser(updatedUser);
      setIsEditing(false);
      // alert("บันทึกข้อมูลสำเร็จ!"); // (เอา alert ออก)
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
      // alert("บันทึกข้อมูลไม่สำเร็จ"); // (เอา alert ออก)
    }
  };
  // --- ^^^ สิ้นสุด handleSave ^^^ ---

  const handleLogout = () => {
    navigate("/");
  };

  if (loading) {
    return <div className="profile-container loading">กำลังโหลดข้อมูล...</div>;
  }

  if (!user) {
    return (
      <div className="profile-container loading">
        <p>ไม่พบข้อมูลผู้ใช้ (กรุณาตรวจสอบ HARDCODED_USERNAME)</p>
        <button onClick={handleGoBack} className="back-button">
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-page-header">
        <button onClick={handleGoBack} className="back-button" title="ย้อนกลับ">
          <FiArrowLeft size={24} />
        </button>
        <div className="profile-header">
          <div className="profile-avatar">
            <FiUser size={50} />
          </div>
          <h2>
            {user.username}&nbsp;{user.lastname}
          </h2>
        </div>
      </div>

      <div className="profile-content">
        {/* === ข้อมูลส่วนตัว === */}
        <div className="profile-section">
          <div className="section-header">
            <h3>ข้อมูลส่วนตัว</h3>
            {!isEditing && (
              <button
                onClick={() => {
                  setEditForm(user);
                  setIsEditing(true);
                }}
                className="edit-btn"
              >
                <FiEdit2 size={16} /> แก้ไข
              </button>
            )}
          </div>

          <div className="details-grid">
            {/* --- โหมดแสดงผล (ใช้ state 'user') --- */}
            {!isEditing && (
              <>
                <div className="detail-item">
                  <span>
                    <FiPhone /> เบอร์โทรศัพท์
                  </span>
                  <p>{user.phone}</p>
                </div>
                <div className="detail-item full-width">
                  <span>
                    <FiMapPin /> ที่อยู่สำหรับจัดส่ง
                  </span>
                  <p>{formatUserDetailsAddress(user.details)}</p>
                </div>
              </>
            )}

            {/* --- โหมดแก้ไข (ใช้ state 'editForm') --- */}
            {isEditing && (
              <>
                <div className="detail-item editable">
                  <label htmlFor="username">ชื่อผู้ใช้ (Username)</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={editForm.username}
                    onChange={handleEditInputChange}
                  />
                </div>
                <div className="detail-item editable">
                  <label htmlFor="phone">เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditInputChange}
                  />
                </div>

                <div className="detail-item editable">
                  <label htmlFor="address">ที่อยู่ (บ้านเลขที่, ถนน)</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={editForm.details?.address || ""}
                    onChange={handleEditInputChange}
                  />
                </div>
                <div className="detail-item editable">
                  <label htmlFor="city">เขต/อำเภอ</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={editForm.details?.city || ""}
                    onChange={handleEditInputChange}
                  />
                </div>
                <div className="detail-item editable">
                  <label htmlFor="province">จังหวัด</label>
                  <input
                    type="text"
                    id="province"
                    name="province"
                    value={editForm.details?.province || ""}
                    onChange={handleEditInputChange}
                  />
                </div>
                <div className="detail-item editable">
                  <label htmlFor="zipcode">รหัสไปษณีย์</label>
                  <input
                    type="text"
                    id="zipcode"
                    name="zipcode"
                    value={editForm.details?.zipcode || ""}
                    onChange={handleEditInputChange}
                  />
                </div>

                <div className="edit-actions full-width">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="cancel-btn"
                  >
                    ยกเลิก
                  </button>
                  <button onClick={handleSave} className="save-btn">
                    <FiSave size={16} /> บันทึกข้อมูล
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* === ประวัติการจอง === */}
        <div className="profile-section">
          <div className="section-header">
            <h3>ประวัติการจอง</h3>
            <Link to="/booking-status" className="view-all-link">
              ดูสถานะการจอง
            </Link>
          </div>
          <div className="booking-history-list">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="booking-item"
                  onClick={() => setSelectedBooking(booking)}
                  title="คลิกเพื่อดูรายละเอียด"
                >
                  <div className="booking-icon">
                    <FiShoppingBag />
                  </div>
                  <div className="booking-details">
                    <p className="booking-package">
                      {booking.details.packageName}
                    </p>
                    <p className="booking-date">
                      วันที่:{" "}
                      {new Date(booking.WorkDate).toLocaleDateString("th-TH")}
                    </p>
                  </div>
                  <div className="booking-summary">
                    <span className={`status ${booking.status}`}>
                      {booking.status}
                    </span>
                    <p className="booking-total">
                      {booking.totalPrice.toLocaleString()} บาท
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>ยังไม่มีประวัติการจอง</p>
            )}
          </div>
        </div>
      </div>

      {/* ส่วนปุ่มออกจากระบบ */}
      <div className="profile-actions">
        <button onClick={() => logout()} className="logout-btn">
          ออกจากระบบ
        </button>
      </div>

      {/* === Modal (ป๊อปอัปรายละเอียด) === */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setSelectedBooking(null)}
            >
              <FiX size={24} />
            </button>

            <h2>รายละเอียดการจอง #{selectedBooking._id}</h2>

            <div className="modal-section summary-short">
              <div className="modal-detail-item">
                <span>แพ็คเกจ</span>
                <p>{selectedBooking.details.packageName}</p>
              </div>
              <div className="modal-detail-item">
                <span>วันที่จัดงาน</span>
                <p>
                  {new Date(selectedBooking.WorkDate).toLocaleDateString(
                    "th-TH"
                  )}
                </p>
              </div>
              <div className="modal-detail-item">
                <span>ยอดรวม</span>
                <p className="modal-total-price">
                  {selectedBooking.totalPrice.toLocaleString()} บาท
                </p>
              </div>
            </div>

            {selectedBooking.address && (
              <div className="modal-section">
                <h3>ที่อยู่จัดส่ง</h3>
                <p>{`${selectedBooking.address.address}, อ/เขต ${selectedBooking.address.city}, จ. ${selectedBooking.address.province} ${selectedBooking.address.zipcode}`}</p>
              </div>
            )}

            {selectedBooking.details.selectedDishes && (
              <div className="modal-section">
                <h3>รายการอาหาร ({selectedBooking.details.table} โต๊ะ)</h3>
                <ul className="modal-item-list">
                  
                  {/* === [จุดที่แก้ไข] === */}
                  {selectedBooking.details.selectedDishes.map((dish, i) => (
                    <li key={i}>
                      - {dish.name ? dish.name : dish}
                    </li> 
                    // ถ้า dish เป็น object ให้ใช้ dish.name, ถ้าเป็น string ให้ใช้ dish
                  ))}
                  {/* ===================== */}

                </ul>
              </div>
            )}

            {selectedBooking.details.selectedAddonFoods &&
              selectedBooking.details.selectedAddonFoods.length > 0 && (
                <div className="modal-section">
                  <h3>อาหารสั่งเพิ่ม</h3>
                  <ul className="modal-item-list with-price">
                    {selectedBooking.details.selectedAddonFoods.map(
                      (item, i) => (
                        <li key={i}>
                          <span>
                            - {item.name} (x{item.quantity})
                          </span>
                          <span>{item.total.toLocaleString()} บาท</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;