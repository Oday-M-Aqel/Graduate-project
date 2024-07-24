const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  customer: {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      minlength: 10,
    },
    City: {
      type: String,
      required: true,
    },
    address1: {
      type: String,
      required: true,
    },
    address2: {
      type: String,
      required: false,
    },
  },
  products: [
    {
      productId: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    }
  ],
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  scores: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
  },
  paymentType: {
    type: String,
    enum: ["Cash", "Score"],
    default: "Cash",
  }
});

// orderSchema.pre('save', function (next) {
//   const now = new Date();
//   const gmtPlus3 = new Date(now.getTime() + (3 * 60 * 60 * 1000));
//   this.createdAt = gmtPlus3;
//   next();
// });

module.exports = Order = mongoose.model("Order", orderSchema);
