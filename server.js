
const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Test API endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "FigVault server is running!"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`FigVault is running at http://localhost:${PORT}`);
});
