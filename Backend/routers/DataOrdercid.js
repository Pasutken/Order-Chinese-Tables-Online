const router = require("express").Router();
const Record = require("../model/recordrecModel");


router.get("/DataOrderChagedetail/:Cid", async (req, res) => {
  try {
    const { Cid } = req.params;0
    console.log("Cid", Cid);

    const ChangeProcessing = await Record.findOne({ cid: Cid });

    if (!ChangeProcessing) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      detail: ChangeProcessing,
      message: "Success",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

module.exports = router;
