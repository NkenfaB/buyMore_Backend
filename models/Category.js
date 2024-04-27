const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  imageUrl: String,
  status: String,
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
