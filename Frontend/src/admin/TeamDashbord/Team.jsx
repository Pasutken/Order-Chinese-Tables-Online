// ไฟล์: TeamAssignment.jsx
import { useEffect, useState } from "react";
import "./Team.css";
import axios from "axios";

function TeamAssignment() {
  const [orders, setOrders] = useState([]);
  const [teams, setTeams] = useState([]);
  const [TeamOrder, setTeamOrder] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showTeamSelectModal, setShowTeamSelectModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [globalModal, setGlobalModal] = useState({ show: false, title: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });
  const closeGlobalModal = () => setGlobalModal({ show: false, title: '', message: '' });
  const closeConfirmModal = () => setConfirmModal({ show: false, title: '', message: '', onConfirm: null });

  // ฟอร์มทีม
  const [teamForm, setTeamForm] = useState({
    teamName: "",
    leader: "",
    memberCount: 1
  });

  useEffect(() => {
    fetchOrders();
    fetchTeams();
    fecthOrderWithTeam();
  }, [orders]);

   useEffect(() => {
    fecthOrderWithTeam();
  }, [TeamOrder]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/DataOrderAllNoTeam");
      setOrders(res.data.AllNoTeam || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/teams");
      setTeams(res.data.teams || []);
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  };

  const fecthOrderWithTeam = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/DataOrderAllWithTeam");
      setTeamOrder(res.data.AllTeam || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  // เปิด modal มอบหมายทีม
  const openAssignModal = (order) => {
    setSelectedOrder(order);
    setShowAssignModal(true);
  };

  // มอบหมายทีม
  const assignTeam = async (teamId) => {
    try {
      await axios.put(`http://localhost:3000/api/assignTeam/${selectedOrder._id}`, { teamId });
      setShowAssignModal(false);
      setGlobalModal({ show: true, title: 'สำเร็จ', message: 'มอบหมายทีมสำเร็จ' });
      fetchOrders();
    } catch (err) {
      setGlobalModal({ show: true, title: 'เกิดข้อผิดพลาด', message: 'เกิดข้อผิดพลาดในการมอบหมายทีม' });
    }
  };

  // เปิด modal สร้างทีม
  const openCreateTeamModal = () => {
    setEditingTeam(null);
    setTeamForm({ teamName: "", leader: "", memberCount: 1 });
    setShowTeamModal(true);
  };

  // เปิด modal เลือกทีมเพื่อแก้ไข
  const openTeamSelectModal = () => {
    setShowTeamSelectModal(true);
  };

  // เลือกทีมเพื่อแก้ไข
  const selectTeamToEdit = (team) => {
    setEditingTeam(team);
    setTeamForm({
      teamName: team.teamName,
      leader: team.leader,
      memberCount: team.memberCount
    });
    setShowTeamSelectModal(false);
    setShowTeamModal(true);
  };

  const closeTeamModal = () => {
    setShowTeamModal(false);
    setEditingTeam(null);
  };

  const closeTeamSelectModal = () => {
    setShowTeamSelectModal(false);
  };

  // สร้างทีม
  const createTeam = async () => {
    if (!teamForm.teamName || !teamForm.leader) {
      setGlobalModal({ show: true, title: 'กรุณากรอกข้อมูล', message: 'กรุณากรอกชื่อทีมและหัวหน้าทีม' });
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/teams", {
        teamName: teamForm.teamName,
        leader: teamForm.leader,
        memberCount: parseInt(teamForm.memberCount),
        members: []
      });
      setTeams([...teams, res.data.team]);
      closeTeamModal();
      setGlobalModal({ 
        show: true, 
        title: 'สำเร็จ', 
        message: `สร้างทีม "${teamForm.teamName}" เรียบร้อยแล้ว` 
      });
    } catch (err) {
      setGlobalModal({ show: true, title: 'ผิดพลาด', message: 'สร้างทีมล้มเหลว' });
    }
  };

  // แก้ไขทีม
  const updateTeam = async () => {
    try {
      const res = await axios.put(`http://localhost:3000/api/teams/${editingTeam._id}`, {
        memberCount: parseInt(teamForm.memberCount)
      });
      setTeams(teams.map(t => t._id === editingTeam._id ? res.data.team : t));
      closeTeamModal();
      setGlobalModal({ 
        show: true, 
        title: 'สำเร็จ', 
        message: `บันทึกการเปลี่ยนแปลงทีม "${editingTeam.teamName}" เรียบร้อยแล้ว` 
      });
    } catch (err) {
      setGlobalModal({ show: true, title: 'ผิดพลาด', message: 'แก้ไขทีมล้มเหลว' });
    }
  };

  // ลบทีม
  const deleteTeam = async (teamId) => {
    setConfirmModal({
      show: true,
      title: 'ยืนยันการลบทีม',
      message: 'คุณต้องการลบทีมนี้หรือไม่?',
      onConfirm: async () => {
        try {
          await axios.delete(`http://localhost:3000/api/teams/${teamId}`);
          setTeams(teams.filter(t => t._id !== teamId));
          closeConfirmModal();
          setGlobalModal({ show: true, title: 'สำเร็จ', message: 'ลบทีมเรียบร้อยแล้ว' });
        } catch (err) {
          setGlobalModal({ show: true, title: 'ผิดพลาด', message: 'ลบทีมล้มเหลว' });
          closeConfirmModal();
        }
      }
    });
  };

  // ทำเครื่องหมายออเดอร์ว่าเสร็จงาน โดยเรียก API ตามที่ระบุ (ใช้ id เป็น order.assignedTeam)
  const completeOrder = async (order) => {
    console.log(order)
    try {
      await axios.put(`http://localhost:3000/api/updateRecordStatus/${order}`);
      setGlobalModal({ show: true, title: 'สำเร็จ', message: 'บันทึกสถานะเสร็จงานเรียบร้อย' });

      fecthOrderWithTeam();
      fetchOrders();
    } catch (err) {
      console.error("Error updating record status:", err);
      setGlobalModal({ show: true, title: 'ผิดพลาด', message: 'ไม่สามารถอัปเดตสถานะได้' });
    }
  };

  const searchHeadTeam = (_oid) => {
    try {
      const team = teams.find(team => team._id === _oid);
      return team ? `ทีม: ${team.teamName} (${team.leader})` : 'ไม่พบข้อมูลทีม';
    } catch (err) {
      console.error("Error searching team:", err);
      return 'เกิดข้อผิดพลาด';
    }
  }
  return (
    <div className="Page-menu">
      

      {/* Main Content */}
      <div className="Page-content">
        <div className="Ordering">
          <div className="Ordering-Header">
            <h1>มอบหมายทีมงานให้ออเดอร์</h1>
            <div className="team-management-buttons">
              <button className="btn-create" onClick={openCreateTeamModal}>
                สร้างทีม
              </button>
              <button className="btn-edit-all" onClick={openTeamSelectModal} disabled={teams.length === 0}>
                แก้ไขทีม
              </button>
            </div>
          </div>

          {/* รายการออเดอร์ */}
          <div className="Ordering-List">
            {orders.map((order) => (
              <div key={order._id} className="Ordering-Card" onClick={() => openAssignModal(order)}>
                <div className="Ordering-Card-Header">
                  <h2>ออเดอร์ #{order.cid}</h2>
                  <p>ลูกค้า: {order.username}</p>
                  <p>วันที่: {new Date(order.WorkDate).toLocaleDateString('th-TH')}</p>
                  <p className="pending">ยังไม่มอบหมาย</p>
                </div>
              </div>
            ))}
          </div>

          {/* รายการออเดอร์ที่มอบหมาย */}
          <div className="Ordering-list-Team" style={{ marginTop: '40px' }}>
            <h2>ออเดอร์ที่มอบหมาย</h2>
            {TeamOrder.map((order) => {
              const assigned = teams.find(t => t._id === order.assignedTeam);
              return (
                <div key={order._id} className="Ordering-Card team-doing-card">
                  <div className="Ordering-Card-Header">
                    <h2>ออเดอร์ #{order.cid}</h2>
                    <p>ลูกค้า: {order.username}</p>
                    <p>วันที่: {new Date(order.WorkDate).toLocaleDateString('th-TH')}</p>
                    <p className="pending">{assigned ? `ทีม: ${assigned.teamName}` : 'ไม่พบข้อมูลทีม'}</p>
                    <p className="team-leader">หัวหน้าทีม: {assigned ? assigned.leader : 'ไม่พบข้อมูล'}</p>
                  </div>

                  {/* overlay สำหรับการทำงานเสร็จ เมื่อ hover จะขยายเป็น 50% */}
                  <div className="complete-overlay" onClick={(e) => e.stopPropagation()}>
                    <div className="overlay-content">
                      <button className="btn-complete" onClick={() => completeOrder(order.assignedTeam)}>เสร็จงาน</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Modal: มอบหมายทีม (สวย + แสดงรายละเอียดออเดอร์) */}
      {showAssignModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content assign-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>มอบหมายทีมให้ออเดอร์ #{selectedOrder.cid}</h2>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>×</button>
            </div>

            <div className="modal-body">
              {/* รายละเอียดออเดอร์ */}
              <div className="order-details-section">
                <h3>รายละเอียดออเดอร์</h3>
                <div className="order-info">
                  <p><strong>ลูกค้า:</strong> {selectedOrder.username}</p>
                  <p><strong>เบอร์โทร:</strong> {selectedOrder.phone}</p>
                  <p><strong>วันที่จัดงาน:</strong> {new Date(selectedOrder.WorkDate).toLocaleDateString('th-TH')}</p>
                  <p><strong>เวลาจัดงาน:</strong> {selectedOrder.WorkTime}</p>
                  <p><strong>ที่อยู่:</strong> {selectedOrder.address?.address}, {selectedOrder.address?.city}</p>
                  <p><strong>ราคารวม:</strong> {selectedOrder.totalPrice?.toLocaleString()} บาท</p>
                  <div className="order-items">
                    <strong>รายการอาหาร:</strong>
                    <ul>
                      {selectedOrder.details?.items?.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                    {selectedOrder.details?.notes && <p><em>หมายเหตุ: {selectedOrder.details.notes}</em></p>}
                  </div>
                </div>
              </div>

              <div className="team-selection-section">
                <h3>เลือกทีมงาน</h3>
                {teams.length === 0 ? (
                  <p className="no-team">ยังไม่มีทีมงาน กรุณาสร้างทีมก่อน</p>
                ) : (
                  <div className="team-grid">
                    {teams.map((team) => (
                      <div key={team._id} className="team-card-select" onClick={() => assignTeam(team._id)}>
                        <div className="team-card-header">
                          <h4>{team.teamName}</h4>
                          <span className="team-badge">{team.memberCount} คน</span>
                        </div>
                        <p className="team-leader">หัวหน้า: {team.leader}</p>
                        <div className="team-card-actions">
                          <button className="btn-assign">มอบหมาย</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                  {/* Global alert modal is rendered at root level to avoid nesting inside other modals */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global alert modal (replaces alert()) - placed at root so it always renders */}
      {globalModal.show && (
        <div className="modal-overlay" onClick={closeGlobalModal}>
          <div className="modal-content global-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{globalModal.title || 'แจ้งเตือน'}</h2>
              <button className="modal-close" onClick={closeGlobalModal}>×</button>
            </div>
            <div className="modal-body">
              <p>{globalModal.message}</p>
            </div>
            <div className="modal-actions">
              <button className="btn-accept" onClick={closeGlobalModal}>ตกลง</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: เลือกทีมเพื่อแก้ไข */}
      {showTeamSelectModal && (
        <div className="modal-overlay" onClick={closeTeamSelectModal}>
          <div className="modal-content select-team-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>เลือกทีมที่ต้องการแก้ไข</h2>
              <button className="modal-close" onClick={closeTeamSelectModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="team-grid">
                {teams.map((team) => (
                  <div key={team._id} className="team-card-select" onClick={() => selectTeamToEdit(team)}>
                    <div className="team-card-header">
                      <h4>{team.teamName}</h4>
                      <span className="team-badge">{team.memberCount} คน</span>
                    </div>
                    <p className="team-leader">หัวหน้า: {team.leader}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: สร้าง/แก้ไขทีม */}
      {showTeamModal && (
        <div className="modal-overlay" onClick={closeTeamModal}>
          <div className="modal-content team-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTeam ? "แก้ไขทีมงาน" : "สร้างทีมงานใหม่"}</h2>
              <button className="modal-close" onClick={closeTeamModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>ชื่อทีม</label>
                <input
                  type="text"
                  value={teamForm.teamName}
                  onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })}
                  placeholder="เช่น Team A"
                  disabled={!!editingTeam}
                />
              </div>
              <div className="form-group">
                <label>หัวหน้าทีม</label>
                <input
                  type="text"
                  value={teamForm.leader}
                  onChange={(e) => setTeamForm({ ...teamForm, leader: e.target.value })}
                  placeholder="ชื่อหัวหน้า"
                  disabled={!!editingTeam}
                />
              </div>
              <div className="form-group">
                <label>จำนวนสมาชิก (รวมหัวหน้า)</label>
                <input
                  type="number"
                  min="1"
                  value={teamForm.memberCount}
                  onChange={(e) => setTeamForm({ ...teamForm, memberCount: Math.max(1, parseInt(e.target.value) || 1) })}
                />
              </div>

              <div className="modal-actions">
                <button className="btn-accept" onClick={editingTeam ? updateTeam : createTeam}>
                  {editingTeam ? "บันทึก" : "สร้างทีม"}
                </button>
                {editingTeam && (
                  <button
                    className="btn-delete"
                    onClick={() => {
                      // deleteTeam already prompts for confirmation
                      deleteTeam(editingTeam._id);
                      closeTeamModal();
                    }}
                  >
                    ลบทีม
                  </button>
                )}
                <button className="btn-reject" onClick={closeTeamModal}>ยกเลิก</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {confirmModal.show && (
        <div className="modal-overlay" onClick={closeConfirmModal}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{confirmModal.title}</h2>
              <button className="modal-close" onClick={closeConfirmModal}>×</button>
            </div>
            <div className="modal-body">
              <p>{confirmModal.message}</p>
            </div>
            <div className="modal-actions">
              <button className="btn-confirm" onClick={confirmModal.onConfirm}>ยืนยัน</button>
              <button className="btn-cancel" onClick={closeConfirmModal}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamAssignment;