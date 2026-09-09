import { Outlet } from 'react-router-dom';
import Topbar from '../Topbar/Topbar'; // (เช็ค Path ให้ถูก)

const MainLayout = () => {
  return (
    <>
      <Topbar />
      <main> 
        <Outlet />
      </main>
    </>
  );
};

export default MainLayout;