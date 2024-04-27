const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Category = require("./models/Category");
const Product = require("./models/Product");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/categoriesDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.post("/api/products", async (req, res) => {
  try {
    const { name, description, imageUrl, country, category, tags } = req.body;
    const product = new Product({
      name,
      description,
      imageUrl,
      country,
      category,
      tags,
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, description, imageUrl, country, category, tags } = req.body;
    const product = new Product({
      name,
      description,
      imageUrl,
      country,
      category,
      tags,
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const { categoryName, description, imageUrl } = req.body;
    const category = new Category({
      name: categoryName,
      description,
      imageUrl,
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
