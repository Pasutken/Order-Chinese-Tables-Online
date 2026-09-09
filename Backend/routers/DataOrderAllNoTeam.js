const router = require("express").Router();
const DataOrderAllNoTeam = require("../model/recordrecModel");
router.get("/DataOrderAllNoTeam", async (req, res) => {
  try {
    const AllNoTeam = await DataOrderAllNoTeam.find({
      assignedTeam: { $exists: false },
      status: 'in-progress',
    });

    res.status(200).json({
      AllNoTeam: AllNoTeam,
      message: "Success",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/DataOrderAllWithTeam", async (req, res) => {
  try {
    const AllTeam = await DataOrderAllNoTeam.find({
      assignedTeam: { $exists: true },
      status: { $ne: "completed" },
    });

    res.status(200).json({
      AllTeam: AllTeam,
      message: "Success",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports = module.exports = router;
