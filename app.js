// Import required modules
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import routes
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

// Import database configuration
require("./config/database");

// Create Express app
const app = express();
const PORT = 5000;

// Middleware setup
app.use(cors());
app.use(express.json());

// Use routes
app.use("/api", productRoutes);
app.use("/api", categoryRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
