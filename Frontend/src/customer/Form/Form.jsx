import { useState, useEffect } from "react";
import "./Form.css";
import { useLocation, useNavigate } from "react-router-dom";

// (ฟังก์ชัน fetch แบบย่อ)
const apiFetch = async (url, config) => {
  const response = await fetch(url, config);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "เกิดข้อผิดพลาด");
  }
  return response.json();
};


function Form() {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingState = location.state || {};
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [bookingUserId, setBookingUserId] = useState(null);

  useEffect(() => {
    if (!bookingState.packageName) {
      alert("กรุณาเลือกแพ็คเกจเมนูก่อนครับ");
      navigate("/");
      return;
    }

    const fetchProfileAndSetForm = async () => {
      let profileData = {};
      const token = localStorage.getItem("token");
      try {
        profileData = await apiFetch(
          `http://localhost:3000/api/users/username`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // ใส่ Token แบบ Bearer
            },
          }
        );
        setBookingUserId(profileData._id); // บันทึก ID ผู้ใช้
      } catch (error) {
        console.error("ไม่สามารถดึงข้อมูลผู้ใช้ (สำหรับเติมฟอร์ม):", error);
      }

      // (แก้ไข initialState ให้ตรงกับ Model 4 ช่อง)
      setFormData({
        contactName: bookingState.contactName || profileData.username || "",
        phone: bookingState.phone || profileData.phone || "",
        lineId: bookingState.lineId || "",
        email: bookingState.email || "",
        eventDate: bookingState.eventDate || "",
        eventTime: bookingState.eventTime || "",
        location: bookingState.location || "",
        tableCount: bookingState.tableCount || 1,
        address: {
          address:
            bookingState.address?.address || profileData.details?.address || "", // ที่อยู่ (บรรทัด 1)
          district:
            bookingState.address?.district || profileData.details?.city || "", // อำเภอ/เขต
          province:
            bookingState.address?.province ||
            profileData.details?.province ||
            "", // จังหวัด
          zipCode:
            bookingState.address?.zipCode || profileData.details?.zipcode || "", // รหัสไปรษณีย์
        },
        remarks: bookingState.remarks || "",
      });

      setIsLoading(false);
    };

    fetchProfileAndSetForm();
  }, [bookingState, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      address: {
        ...prevState.address,
        [name]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allBookingData = {
      ...bookingState,
      ...formData,
      bookingUserId: bookingUserId,
    };
    navigate("/summary", { state: allBookingData });
  };

  if (isLoading || !bookingState.packageName) {
    return (
      <div
        style={{ textAlign: "center", marginTop: "20px", fontFamily: "Kanit" }}
      >
        กำลังเตรียมฟอร์ม...
      </div>
    );
  }

  const getMinDate = () => {
  const today = new Date();
  today.setDate(today.getDate() + 7); // บวกเพิ่ม 7 วัน
  return today.toISOString().split('T')[0]; // แปลงเป็น format YYYY-MM-DD
};

  return (
    <div className="form-container">
      <h2>กรอกข้อมูลการจอง</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group full-width">
          <label htmlFor="contactName">ชื่อผู้ติดต่อ</label>
          <input
            type="text"
            id="contactName"
            name="contactName"
            value={formData.contactName || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">เบอร์โทรศัพท์ (10 หลัก)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              title="กรุณากรอกเบอร์โทรศัพท์ 10 หลัก (ไม่มีขีด)"
            />
          </div>
          <div className="form-group">
            <label htmlFor="lineId">LINE ID</label>
            <input
              type="text"
              id="lineId"
              name="lineId"
              value={formData.lineId || ""}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="eventDate">วันที่จัดงาน</label>
            <input
              type="date"
              id="eventDate"
              name="eventDate"
              value={formData.eventDate || ""}
              onChange={handleChange}
              required
              min={getMinDate()}
            />
          </div>
          <div className="form-group">
            <label htmlFor="eventTime">เวลาเริ่มงาน</label>
            <input
              type="time"
              id="eventTime"
              name="eventTime"
              value={formData.eventTime || ""}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">สถานที่จัดงาน</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location || ""}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="tableCount">จำนวนโต๊ะ</label>
            <input
              type="number"
              id="tableCount"
              name="tableCount"
              value={formData.tableCount || 1}
              onChange={handleChange}
              min="1"
              readOnly={!!bookingState?.tableCount}
              className={bookingState?.tableCount ? "prefilled" : ""}
            />
          </div>
        </div>

        <div className="form-group full-width section-title">
          <h3>ข้อมูลที่อยู่</h3>
        </div>

        {/* (แก้ไข JSX ของที่อยู่ให้เหลือ 4 ช่อง) */}
        <div className="form-group full-width">
          <label htmlFor="address">ที่อยู่ (บ้านเลขที่, หมู่, ซอย, ถนน)</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address?.address || ""}
            onChange={handleAddressChange}
            required
          />
        </div>

        <div className="form-row three-columns">
          <div className="form-group">
            <label htmlFor="district">อำเภอ/เขต</label>
            <input
              type="text"
              id="district"
              name="district"
              value={formData.address?.district || ""}
              onChange={handleAddressChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="province">จังหวัด</label>
            <input
              type="text"
              id="province"
              name="province"
              value={formData.address?.province || ""}
              onChange={handleAddressChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="zipCode">รหัสไปรษณีย์</label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.address?.zipCode || ""}
              onChange={handleAddressChange}
              required
              pattern="[0-9]{5}"
              title="กรุณากรอกรหัสไปรษณีย์ 5 หลัก"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="remarks">หมายเหตุ</label>
          <textarea
            id="remarks"
            name="remarks"
            rows="5"
            value={formData.remarks || ""}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="form-button-container">
          <button type="submit">ต่อไป (สรุปรายการ)</button>
        </div>
      </form>
    </div>
  );
}

export default Form;
