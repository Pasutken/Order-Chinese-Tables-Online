// routes/team.js
const router = require("express").Router();
const Record = require("../model/recordrecModel");
let Team = require("../model/Team");


// GET: ดึงทีมทั้งหมด
router.get("/teams", async (req, res) => {
  try {
    const teams = await Team.find();
    res.json({ teams });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: สร้างทีม
router.post("/teams", async (req, res) => {
  try {
    const team = new Team(req.body);
    await team.save();
    res.json({ team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: มอบหมายทีมให้ออเดอร์
router.put("/assignTeam/:id", async (req, res) => {
  try {
    const { teamId } = req.body;
    const team = await Team.findById(teamId);
    const order = await Record.findByIdAndUpdate(
      req.params.id,
      { assignedTeam: team, status: "Assigned-To-Team" },
      { new: true }
    );
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// แก้ไขข้อมูลทีม
router.put("/teams/:id", async (req, res) => {
  try {
    const { memberCount } = req.body;
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { memberCount },
      { new: true }
    );
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json({ team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ลบทีม
router.delete("/teams/:id", async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: "Team deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// แก้ไขStatus Record
router.put("/updateRecordStatus/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Record.findOneAndUpdate(
      { assignedTeam: id, status: { $ne: "completed" } },
      { status: "completed" },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ order });
  } catch (err) {
    
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;