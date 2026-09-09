import "./AboutUs.css";
import chowderup from "./chowderup.png";
import mungdaal from "./mungdaal.png";
import chowder from "./chowder.jpg";
import { FiAward, FiUsers, FiHeart } from "react-icons/fi";

const AboutUs = () => {
  return (
    <div className="page-container">
      <div className="about-container">
        <h1 className="main-title">เกี่ยวกับเรา</h1>

        {/* ===== Hero Section ===== */}
        <section className="about-content">
          <div className="about-text">
            <h2 className="fade-in">ตำนานความอร่อยที่สืบทอดมาเนิ่นนาน</h2>
            <p className="fade-in delay-1">
              <strong>ชาวเดอร์ โต๊ะจีน</strong> ก่อตั้งจากตำรับอาหารจีนแท้
              ที่ผสานความประณีตเข้ากับรสชาติอันล้ำลึก
              ทุกจเคยคือการเดินทางของรสชาติที่ยากจะลืมเลือน
            </p>
            <p className="fade-in delay-2">
              ด้วยประสบการณ์อันยาวนานกว่า <strong>20 ปี</strong>
              และสูตรลับที่สืบทอดจากรุ่นสู่รุ่น
              เราเลือกใช้วัตถุดิบชั้นเลิศ สดใหม่ทุกวัน
              ปรุงด้วยใจ และเสิร์ฟด้วยความทุ่มเท
            </p>
            <p className="fade-in delay-3">
              ทุกงานเลี้ยงของคุณ คือเกียรติยศของเรา
            </p>
          </div>

          <div className="about-image fade-in delay-4">
            <img
              src={chowderup}
              alt="ทีมงานชาวเดอร์ โต๊ะจีน พร้อมเสิร์ฟความประทับใจ"
              loading="lazy"
              className="hero-img"
            />
          </div>
        </section>

        {/* ===== เชฟผู้อยู่เบื้องหลังความอร่อย ===== */}
        <section className="chefs-section">
          <h2 className="section-title fade-in">สุดยอดเชฟประจำร้าน</h2>
          <div className="chef-card-grid">
            <article className="chef-card fade-in">
              <div className="chef-photo-wrapper">
                <img
                  src={mungdaal}
                  alt="เชฟมัง ดาอัล ผู้ก่อตั้งชาวเดอร์ โต๊ะจีน"
                  className="chef-photo"
                  loading="lazy"
                />
              </div>
              <h3>มุง ดาล</h3>
              <span className="chef-title">ผู้ก่อตั้ง & หัวหน้าเชฟ</span>
              <p className="quote">
                “อาหารคือศิลปะที่กินได้ ความสุขคือการเห็นทุกคนอิ่มทั้งกายและใจ”
              </p>
            </article>

            <article className="chef-card fade-in delay-1">
              <div className="chef-photo-wrapper">
                <img
                  src={chowder}
                  alt="ชาวเดอร์ ลูกศิษย์ผู้คลั่งไคล้ในรสชาติ"
                  className="chef-photo"
                  loading="lazy"
                />
              </div>
              <h3>ชาวเดอร์</h3>
              <span className="chef-title">ผู้ช่วยเชฟ & นักสร้างสรรค์รสชาติ</span>
              <p className="quote">
                “ทุกความผิดพลาด คือก้าวแรกสู่เมนูในตำนาน”
              </p>
            </article>
          </div>
        </section>

        {/* ===== จุดเด่น 3 ข้อ สไตล์พรีเมียม ===== */}
        <section className="highlights">
          <div className="highlight-card fade-in">
            <div className="icon-wrapper">
              <FiAward size={56} />
            </div>
            <h3>สูตรลับกว่า 20 ปี</h3>
            <p>รสชาติที่สั่งสมจากประสบการณ์ และความทุ่มเท</p>
          </div>
          <div className="highlight-card fade-in delay-1">
            <div className="icon-wrapper">
              <FiUsers size={56} />
            </div>
            <h3>บริการเหนือระดับ</h3>
            <p>จัดเลี้ยงนอกสถานที่ ครบครัน ทั่วกรุงเทพและปริมณฑล</p>
          </div>
          <div className="highlight-card fade-in delay-2">
            <div className="icon-wrapper">
              <FiHeart size={56} />
            </div>
            <h3>วัตถุดิบชั้นเลิศ</h3>
            <p>คัดสรรอย่างพิถีพิถัน สดใหม่ ปลอดภัยทุกจาน</p>
          </div>
        </section>

        
      </div>
    </div>
  );
};

export default AboutUs;