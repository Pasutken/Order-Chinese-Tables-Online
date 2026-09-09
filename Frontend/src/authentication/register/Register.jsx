import "./Register.css";
import "./Register.modal.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [mockOtp, setMockOtp] = useState("");
  const [timer, setTimer] = useState(300);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (showOtpModal && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, timer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const generateMockOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setMockOtp(otp);
    alert(`รหัส OTP ของคุณคือ: ${otp}`);
    return otp;
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleResendOtp = () => {
    setTimer(300);
    generateMockOtp();
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp === mockOtp) {
      // OTP is correct, proceed with registration
      const payload = {
        phone: phone,
        username: name,
        lastname: surname,
        password: password,
      };

      setLoading(true);
      setError("");

      axios
        .post("http://localhost:3000/api/Register", payload)
        .then((res) => {
          console.log("Register response:", res);
          navigate("/login");
        })
        .catch((err) => {
          console.error("Register error:", err);
          const msg =
            err?.response?.data?.error ||
            err.message ||
            "เกิดข้อผิดพลาดในการสมัครสมาชิก";
          setError(msg);
        })
        .finally(() => {
          setLoading(false);
          setShowOtpModal(false);
        });
    } else {
      setError("รหัส OTP ไม่ถูกต้อง");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !surname || !phone || !password) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setError("");
    setShowOtpModal(true);
    generateMockOtp();
  };

  const handleGoogleRegister = () => {
    alert("สมัครสมาชิกด้วย Google (demo)");
  };

  const handleLineRegister = () => {
    alert("สมัครสมาชิกด้วย LINE (demo)");
  };

  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = "";
    e.target.alt = "ไอคอนไม่โหลด";
    e.target.style.display = "none";
    console.error("Image load error:", e.target.src);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>สมัครสมาชิก</h2>
        <p>กรุณากรอกข้อมูลเพื่อสมัครสมาชิก</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ชื่อ</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={error && !name ? "error" : ""}
            />
          </div>

          <div className="form-group">
            <label>นามสกุล</label>
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className={error && !surname ? "error" : ""}
            />
          </div>

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
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>
        </form>

        <hr />

        <button className="btn-social google" onClick={handleGoogleRegister}>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            onError={handleImgError}
          />
          สมัครสมาชิกด้วย Google
        </button>

        <button className="btn-social line-btn" onClick={handleLineRegister}>
          <img
            src="https://simpleicons.org/icons/line.svg"
            alt="LINE"
            onError={handleImgError}
          />
          สมัครสมาชิกด้วย LINE
        </button>

        <p className="signup-text">
          มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
        </p>
      </div>

      {showOtpModal && (
        <div className="modal-overlay">
          <div className="modal-content otp-container">
            <h2>ยืนยันรหัส OTP</h2>
            <p>กรุณากรอกรหัสที่ส่งไปยัง {phone}</p>

            <form onSubmit={handleOtpSubmit} className="otp-form">
              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    className={error && !digit ? "error" : ""}
                  />
                ))}
              </div>

              {error && <p className="error-message">{error}</p>}

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? "กำลังยืนยัน..." : "ยืนยันและสมัครสมาชิก"}
              </button>

              <p className="signup-text">
                <span
                  onClick={timer === 0 ? handleResendOtp : null}
                  style={{
                    color: timer === 0 ? "#0288d1" : "#aaa",
                    cursor: timer === 0 ? "pointer" : "not-allowed",
                  }}
                >
                  ส่งรหัสอีกครั้ง
                </span>{" "}
                {timer > 0 ? formatTime(timer) : ""}
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
