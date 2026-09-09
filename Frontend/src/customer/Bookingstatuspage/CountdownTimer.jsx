import { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

const CountdownTimer = ({ createdAt }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // 1. กำหนดเวลาสิ้นสุด (เวลาที่สร้าง + 24 ชั่วโมง)
    const createdTime = new Date(createdAt).getTime();
    const oneDayInMs = 24 * 60 * 60 * 1000; // 24 ชม. เป็นมิลลิวินาที
    const deadline = createdTime + oneDayInMs;

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = deadline - now;

      if (difference <= 0) {
        // ถ้าหมดเวลาแล้ว
        setIsExpired(true);
        setTimeLeft("หมดเวลาชำระเงิน");
        return;
      }

      // คำนวณ ชม. : นาที : วินาที
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      // จัดรูปแบบให้มีเลข 0 นำหน้าถ้าต่ำกว่า 10 (เช่น 05:09:01)
      const formattedTime = [hours, minutes, seconds]
        .map(v => v.toString().padStart(2, '0'))
        .join(':');

      setTimeLeft(formattedTime);
    };

    // เรียกทำงานทันที 1 ครั้ง
    updateTimer();

    // ตั้ง Loop ให้ทำงานทุก 1 วินาที
    const timerId = setInterval(updateTimer, 1000);

    // เคลียร์ Loop เมื่อ Component ถูกถอดออก (เปลี่ยนหน้า)
    return () => clearInterval(timerId);

  }, [createdAt]);

  if (isExpired) {
    return <span style={{ color: '#999', fontSize: '0.9rem' }}>หมดเวลาชำระเงิน</span>;
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '5px', 
      color: '#d32f2f', 
      fontWeight: 'bold',
      backgroundColor: '#fff0f0',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.9rem',
      marginTop: '5px',
      width: 'fit-content'
    }}>
      <FiClock />
      <span>เหลือเวลา {timeLeft}</span>
    </div>
  );
};

export default CountdownTimer;