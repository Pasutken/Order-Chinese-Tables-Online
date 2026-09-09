import { useState, useEffect , useMemo} from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Dashbord.css";
import axios from "axios";

function DashBord() {
  const [data, setData] = useState({
    orderNow: 0,
    changeDetail: 0,
    orderInYear: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dataInGraph, setDataInGraph] = useState(null)

  const { minOrder, maxOrder } = useMemo(() => {
  
  // 1. ตรวจสอบก่อนว่า dataInGraph มีข้อมูล (ordersByMonth) หรือยัง
  if (!dataInGraph || !dataInGraph.ordersByMonth) {
    // ถ้ายังไม่มีข้อมูล ให้คืนค่า null ไปก่อน
    return { minOrder: null, maxOrder: null };
  }

  // 2. ดึงค่า orderAmount ทั้งหมดออกมา
  // และกรอง (filter) เอาเฉพาะค่าที่เป็นตัวเลข (ตัด null ออก)
  const validAmounts = dataInGraph.ordersByMonth
    .map(item => item.orderAmount) // ดึงเฉพาะตัวเลข [0, 0, 0, ..., 1, null]
    .filter(amount => amount !== null && typeof amount === 'number'); // กรอง null ออก [0, 0, ..., 1]

  // 3. ตรวจสอบว่ามีข้อมูลตัวเลขที่ถูกต้องเหลืออยู่หรือไม่
  if (validAmounts.length === 0) {
    // ถ้าทุกช่องเป็น null หมด
    return { minOrder: null, maxOrder: null };
  }

  // 4. คำนวณค่า min และ max จาก array ตัวเลข
  const min = Math.min(...validAmounts);
  const max = Math.max(...validAmounts);

  return { minOrder: min, maxOrder: max };

}, [dataInGraph]);

  const graphData = (dataInGraph && dataInGraph.ordersByMonth)
  ? dataInGraph.ordersByMonth.map((item) => ({
      month: item.month, // <-- 1. ใช้ item.month
      mouth: item.orderAmount, // <-- 2. ต้องเอาค่า china มาด้วย
    }))
  : [];

  useEffect(() => {
    fetchAllData();
    DataOrderPerMouth()
   
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([DataOrdernow(), DataOrderinYear(), DataOrderChage()]);
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const DataOrdernow = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/Dashboard_DataOrderNow"
      );
      setData((prevData) => ({
        ...prevData,
        orderNow: response.data.orderNow,
      }));
    } catch (err) {
      console.error("Error fetching order now:", err);
    }
  };

  const DataOrderinYear = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/Dashboard_DataOrderInYear"
      );
      console.log(response);
      setData((prevData) => ({
        ...prevData,
        orderInYear: response.data.orderInYear,
      }));
    } catch (err) {
      console.error("Error fetching order in year:", err);
    }
  };

  const DataOrderChage = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/Dashboard_DataOrderChage"
      );
      console.log(response);
      setData((prevData) => ({
        ...prevData,
        changeDetail: response.data.orderChage,
      }));
    } catch (err) {
      console.error("Error fetching order in OrderChage:", err);
    }
  };

  async function DataOrderPerMouth(){
    try{
        const res = await axios.get(`http://localhost:3000/api/Dashboard_DataOrderByMonth`)
        setDataInGraph(res.data)
        console.log("เดือน",res.data)
    }catch{
        console.log(err)
    }
  }

  if (loading) {
    return (
      <div className="Page-menu">
        <div style={{ margin: "auto", fontSize: "24px", color: "#4a3f3f" }}>
          กำลังโหลด...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="Page-menu">
        <div style={{ margin: "auto", fontSize: "24px", color: "#d32f2f" }}>
          เกิดข้อผิดพลาด: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="Page-menu">
      <div className="Page-content">
        <div className="dashbord">
          <div className="dashbord-TotalOrder">
            <h1>ออเดอร์ตอนนี้</h1>
            <p>{data.orderNow}</p>
          </div>
          <div className="dashbord-ChageOrderDetail">
            <h1>ออเดอร์ยอนเปลี่ยนทำหนดการ</h1>
            <p>{data.changeDetail}</p>
          </div>
          <div className="dashbord-TotalOrderinYear">
            <h1>ออเดอร์ทั้งหมดในปีนี้</h1>
            <p>{data.orderInYear}</p>
          </div>
          <div className="dashbord-graph">
            <h1>ข้อมูลสถิติออเดอร์ของแต่ละเดือน</h1>
            <div className="graph-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={graphData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis
                    dataKey="month"
                    stroke="#666"
                    tick={{ fill: "#666", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#666"
                    tick={{ fill: "#666", fontSize: 12 }}
                    domain={[0, maxOrder]}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "10px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="line"
                  />
                  <Line
                    type="monotone"
                    dataKey="mouth"
                    stroke="#e74c3c"
                    strokeWidth={3}
                    name="เดือน"
                    dot={{ fill: "#e74c3c", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashBord;
