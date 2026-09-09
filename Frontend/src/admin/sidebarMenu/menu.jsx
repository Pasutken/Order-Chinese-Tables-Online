import { useEffect, useState } from "react";
import "./menu.css";
import DashBord from "../dashboard/Dashbord"
import ManageProduct from "../manageProducts/mpMain/manageProducts";
import ContactUs from "../contactUs/contactUs";
import ChageDetail from "../OrderChager/ChageDetail";
import Ordering from "../Ordering/Ordering";
import TeamAssignment from "../TeamDashbord/Team"
import CancelOrder from "../cancelOrder/cancelOrder";

import { useAuth } from "../../authentication/AuthContext";

function getPageComponent(buttonName , url) {
  switch(buttonName) {
  case 'button1':
    return <DashBord url={url}/>;
    break;
  case 'button2':
    return <Ordering url={url}/>
  case 'button3':
    return <ChageDetail url={url}/>
    break;
  case 'button4':
    return <TeamAssignment url={url}/>
    break;
  case 'button5':
    return <ManageProduct url={url}/>; 
    break;
  case 'button6':
    return <ContactUs url={url}/>
  case 'button7':
    return <CancelOrder url={url}/>
    default:
      return <DashBord url={url}/>;
  }
}

function Menu({url}) {
  const initialButtonName = localStorage.getItem("buttonName") || 'button1';
  const [activeButton, setActiveButton] = useState(initialButtonName);
  const [page, setPage] = useState(getPageComponent(initialButtonName , url));
  const { logout } = useAuth()

  function selectPage(selectedComponent,buttonName) {
    setPage(selectedComponent);
    setActiveButton(buttonName);
    localStorage.setItem("buttonName", buttonName);
  }



  return (
    <div className="Page-menu">
      <div className="sidebar-menu">
        <h1>Menu Sidebar</h1>
          <div className="selectMenu-container">
          <li onClick={() => selectPage(<DashBord url={url}/> , 'button1')} className={activeButton === 'button1' ? 'sidebar-btn active' : 'sidebar-btn'}>
            Dashborad
          </li>
          <li onClick={() => selectPage(<Ordering url={url}/> , 'button2')} className={activeButton === 'button2' ? 'sidebar-btn active' : 'sidebar-btn'}>รายการที่กำลังดำเนินการ</li>
          <li onClick={() => selectPage(<ChageDetail url={url}/> , 'button3')} className={activeButton === 'button3' ? 'sidebar-btn active' : 'sidebar-btn'}>รายการที่ต้องเปลี่ยนกำหนดการ</li>
          <li onClick={() => selectPage(<CancelOrder url={url}/> , 'button7')} className={activeButton === 'button7' ? 'sidebar-btn active' : 'sidebar-btn'}>รายการที่ถูกยกเลิก</li>
          <li onClick={() => selectPage(<TeamAssignment url={url}/> , 'button4')} className={activeButton === 'button4' ? 'sidebar-btn active' : 'sidebar-btn'}>
            จัดการทีม
          </li>
          <li onClick={() => selectPage(<ManageProduct url={url}/> , 'button5')} className={activeButton === 'button5' ? 'sidebar-btn active' : 'sidebar-btn'}>
            จัดการสินค้า
          </li>
          <li onClick={() => selectPage(<ContactUs url={url}/> , 'button6')} className={activeButton === 'button6' ? 'sidebar-btn active' : 'sidebar-btn'}>
            ติดต่อเรา
          </li>
          </div>
          <hr></hr>
          <li className="sidebar-btn-logout" onClick={() => logout()}>ออกจากระบบ</li>
      </div>
      <div className="Page-content">
        {page}
      </div>
    </div>
  );
}

export default Menu;