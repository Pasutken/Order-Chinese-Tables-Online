import { useState, useEffect } from "react";
import { FiUser, FiChevronDown, FiMenu, FiX } from "react-icons/fi"; // Import ไอคอนเพิ่ม
import "./Topbar.css";
import { useNavigate, Link, useLocation } from "react-router-dom";

const Topbar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State สำหรับเมนูมือถือ
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packages, setPackages] = useState([]);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch data ... (คงเดิม)
  useEffect(() => {
    fetch("http://localhost:3000/api/menus/getpackages")
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data.data)) setPackages(data.data);
        else setPackages([]);
      })
      .catch((err) => {
        console.error(err);
        setPackages([]);
      });
  }, []);

  // ปิด Dropdown เมื่อคลิกข้างนอก (Desktop)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".nav-dropdown-container")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ปิด Mobile Menu เมื่อเปลี่ยนหน้า
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setDropdownOpen(false); // ปิด Dropdown ด้วยเพื่อความเรียบร้อย
  }, [location]);

  const handlePackageClick = (pkg) => {
    setSelectedPackage(pkg);
    setDropdownOpen(false);
    setIsMobileMenuOpen(false); // ปิดเมนูมือถือเมื่อเลือกของ
    navigate(`/menu/${pkg._id}`);
  };

  const isActive = (path) => location.pathname === path;
  const isMenuDropdownActive = location.pathname.startsWith("/menu") || isDropdownOpen;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <header className="topbar-container">
        <nav className="topbar">
          
          {/* 1. ปุ่ม Hamburger (แสดงเฉพาะ Mobile) */}
          <button 
            className="hamburger-btn"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <FiMenu size={24} />
          </button>

          {/* 2. กลุ่มลิงก์ (Menu) */}
          {/* เพิ่ม Class 'mobile-open' เมื่อกดเปิดเมนู */}
          <div className={`topbar-nav-links ${isMobileMenuOpen ? "mobile-open" : ""}`}>
            
            {/* ปุ่มปิดเมนู (แสดงเฉพาะใน Mobile Menu) */}
            <div className="mobile-menu-header">
                <span className="mobile-menu-title">เมนูหลัก</span>
                <button 
                  className="close-menu-btn"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiX size={24} />
                </button>
            </div>

            <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
              หน้าหลัก
            </Link>
            
            <div className="nav-dropdown-container">
              <button
                className={`nav-link ${isMenuDropdownActive ? "active" : ""}`}
                onClick={(e) => {
                    e.stopPropagation(); // ป้องกัน event bubble
                    setDropdownOpen(!isDropdownOpen);
                }}
              >
                <span>{selectedPackage ? selectedPackage.name : "เมนูโต๊ะจีน"}</span>
                <FiChevronDown
                  size={16}
                  className={`chevron ${isDropdownOpen ? "rotated" : ""}`}
                />
              </button>
              <div className={`dropdown-menu ${isDropdownOpen ? "open" : ""}`} >
                {packages.map((pkg) => (
                  <button
                    key={pkg._id}
                    className={`dropdown-item ${location.pathname === `/menu/${pkg._id}` ? "active" : ""}`}
                    onClick={() => handlePackageClick(pkg)}
                  >
                    {pkg.name}
                  </button>
                ))}
              </div>
            </div>
            
            <Link to="/about" className={`nav-link ${isActive("/about") ? "active" : ""}`}>
              เกี่ยวกับเรา
            </Link>
            
            <Link to="/contact" className={`nav-link ${isActive("/contact") ? "active" : ""}`}>
              ติดต่อเรา
            </Link>
          </div>

          {/* Overlay พื้นหลังสีดำจางๆ (แสดงเมื่อเปิดเมนูมือถือ) */}
          {isMobileMenuOpen && (
            <div 
                className="mobile-overlay" 
                onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* 3. ปุ่มโปรไฟล์ (ขวาสุดเสมอ) */}
          <div className="topbar-controls">
            <button
              className={`profile-icon ${isActive("/profile") ? "active" : ""}`}
              onClick={() => navigate("/profile")}
            >
              <FiUser size={22} />
            </button>
          </div>
          
        </nav>
      </header>
    </>
  );
};

export default Topbar;