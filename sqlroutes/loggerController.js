const fs = require("fs");
const express = require("express");

const router = express.Router();

router.get("/getlogs", async (req, res) => {
  const logs = fs.readFileSync("logs.txt", "utf-8");
  res.json({ logs: logs });
});

module.exports = router;
