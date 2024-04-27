const Product = require("../models/Product");

const createProduct = async (req, res) => {
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
};

module.exports = {
  createProduct,
};
