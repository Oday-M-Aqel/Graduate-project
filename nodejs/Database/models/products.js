const mongoose = require("mongoose");

const product_schema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    unique: true,
  },
  price: {
    type: Number,
    require: true,
  },
  status: {
    type: String,
    enum: ["Available", "Not Available"],
    default: "Available",
  },
  type: {
    type: String,
    require: true,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
  description: {
    type: String,
    require: true,
  },
});

module.exports = product = mongoose.model("Product", product_schema);
