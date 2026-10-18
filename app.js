const express = require("express");
const cors = require("cors");
const { createCatalogRouter } = require("./routes/catalogRoutes");

function createApp({
  Product = require("./models/Product"),
  Category = require("./models/Category"),
  adminToken = process.env.ADMIN_TOKEN,
  allowedOrigins = process.env.CORS_ORIGINS ||
    "http://localhost:3000,http://localhost:3001",
} = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.use(
    cors({ origin: allowedOrigins.split(",").map((value) => value.trim()) })
  );
  app.use(express.json({ limit: "100kb" }));
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));
  app.use("/api", createCatalogRouter({ Product, Category, adminToken }));
  app.use((req, res) => res.status(404).json({ error: "Route not found" }));
  app.use((error, req, res, next) => {
    if (error.type === "entity.parse.failed")
      return res.status(400).json({ error: "Invalid JSON" });
    if (error.name === "ValidationError" || error.name === "CastError")
      return res.status(400).json({ error: "Invalid catalog data" });
    if (error.code === 11000)
      return res.status(409).json({ error: "This item already exists" });
    console.error(error.message);
    res
      .status(error.status === 413 ? 413 : 500)
      .json({ error: "Unable to complete request" });
  });
  return app;
}
module.exports = { createApp };
