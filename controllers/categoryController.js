const Category = require("../models/Category");

const createCategory = async (req, res) => {
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
    console.error("Error creating category:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCategory,
};
