const express = require("express");
const bodyParser = require("body-parser");
const userLoginApi = require("./sqlroutes/userloginapi"); // Import the userloginapi route file
const logger = require("./sqlroutes/loggerController");
const app = express();
const port = 3000;

const { exec } = require("child_process");
const cors = require("cors");

app.use(
  cors({
    origin: [
      "https://www.goodgutproject.in",
      "https://goodgutproject.in",
      "http://localhost:3001",
      "https://admindashboard-nu-lovat.vercel.app",
    ],
  })
);

// Handle preflight requests (OPTIONS)
app.options("*", (req, res) => {
  const allowedOrigins = [
    "https://www.goodgutproject.in",
    "https://goodgutproject.in",
    "http://localhost:3001",
    "https://admindashboard-nu-lovat.vercel.app",
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.sendStatus(200);
});

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use("/api", userLoginApi); // Use the userLoginApi routes under "/api"
app.use("/api", logger);

app.get("/test", (req, res) => {
  res.send("App restartedss");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
