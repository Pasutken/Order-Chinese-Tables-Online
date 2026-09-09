import "./Login.css";
import { useState, useEffect } from "react"; // 1. อย่าลืม import useEffect
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // 2. ส่วนนี้คือหัวใจสำคัญ: ตรวจสอบ URL เมื่อหน้าเว็บโหลด
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    const roleParam = params.get("role");

    // ถ้ามี Token ส่งกลับมา (แสดงว่า Login Google สำเร็จ)
    if (tokenParam) {
      // A. บันทึกลง LocalStorage ตามที่คุณต้องการ
      localStorage.setItem("token", tokenParam);
      if (roleParam) {
        localStorage.setItem("role", roleParam);
      }

      // B. อัปเดต State ใน AuthContext (ถ้ามี)
      // ส่งทั้ง token และ role เข้าไป
      if (login) login(tokenParam, roleParam);
      console.log("token", tokenParam, "role", roleParam);
      // C. ตรวจสอบ Role แล้ว Redirect ไปหน้าที่ถูกต้อง
      if (roleParam === "admin") {
        navigate("/menu");
      } else {
        navigate("/");
      }
    }
  }, [navigate, login]); // ทำงานเมื่อ component โหลด

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone || !password) {
      setError("กรุณากรอกเบอร์โทรศัพท์และรหัสผ่าน");
      return;
    }
    setError("");
    setLoading(true);

    const payload = { phone, password };

    axios
      .post("http://localhost:3000/api/login", payload)
      .then((res) => {
        // บันทึก Role ลง LocalStorage สำหรับการ Login แบบปกติด้วย
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);

        login(res.data.token, res.data.role);

        if (res.data.role === "admin") {
          navigate("/menu");
        } else {
          navigate("/");
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
        const msg =
          err?.response?.data?.message ||
          err.message ||
          "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
        setError(msg);
        if (err.status == 401) {
          setError("ไม่พบข้อมูลผู้ใช้");
        }
      })
      .finally(() => setLoading(false));
  };

  const handleGoogleLogin = () => {
    // 3. แก้ไขตรงนี้: ไม่ต้อง setItem ที่นี่ เพราะยังไม่ได้ Token
    // ให้ Redirect ไป Backend อย่างเดียว เดี๋ยว Backend จะส่งกลับมาเข้า useEffect ด้านบนเอง
    window.location.href = "http://localhost:3000/auth/google";
  };

  const handleLineLogin = () => {
    alert("เข้าสู่ระบบด้วย LINE (demo)");
  };

  function guestLogin() {
    navigate("/");
  }

  const handleImgError = (e) => {
    console.error("Image load error:", e.target.src);
    e.target.onerror = null;
    e.target.src = "";
    e.target.alt = "ไอคอนไม่โหลด";
    e.target.style.display = "none";
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>ยินดีต้อนรับ</h2>
        <p>กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>

        <form onSubmit={handleSubmit}>
          {/* ... (ส่วน Form เหมือนเดิม) ... */}
          <div className="form-group">
            <label>เบอร์โทรศัพท์</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={error && !phone ? "error" : ""}
            />
          </div>

          <div className="form-group">
            <label>รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={error && !password ? "error" : ""}
            />
            {/* เพิ่ม wrapper ตรงนี้เพื่อให้ Flexbox ทำงาน */}
            <div className="forgot-password-wrapper">
              <Link to="/forgotpassword" className="forgot-password">
                ลืมรหัสผ่าน?
              </Link>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
        <hr />

        {/* ปุ่ม Google เรียกใช้ handleGoogleLogin ที่แก้แล้ว */}
        <button className="btn-social google" onClick={handleGoogleLogin}>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            onError={handleImgError}
          />
          เข้าสู่ระบบด้วย Google
        </button>

        <button className="btn-social line-btn" onClick={handleLineLogin}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg"
            alt="LINE"
            onError={handleImgError}
          />
          เข้าสู่ระบบด้วย LINE
        </button>

        <button className="btn-social guest-btn" onClick={guestLogin}>
          <img
            src="https://api.iconify.design/mdi/account-question.svg"
            alt="Guest"
            onError={handleImgError}
          />
          เข้าสู่ระบบด้วย Guest
        </button>

        <p className="signup-text">
          ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
