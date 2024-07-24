const mongoose = require("mongoose");
const { isEmail, isNumeric, isStrongPassword } = require("validator");
const bcrypt = require("bcrypt");
const user_schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    minlength: 2,
  },
  phone: {
    type: String,
    required: [true, "Please enter your phone number"],
    minlength: [10, "Phone number must has 10 numbers"],
    validate: [isNumeric, "Phone number must have just a number"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: [true, "this email is already in use"],
    lowercase: true,
    validate: [isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: [8, "The minimum password length is 8"],
    validate: [isStrongPassword, "enter strong password"],//Capital letter, Small letter, number, symbol.
  },
  status: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  score: {
    type: Number,
    default: 0,
  },
  blocked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  orderNumbers: {
    type: Number,
    default: 0,
  },
  reservationNumbers: {
    type: Number,
    default: 0,
  }
});

//before store in db
user_schema.pre("save", async function (next) {
  const added = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, added);
  const now = new Date();
  const gmtPlus3 = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  this.createdAt = gmtPlus3;
  next();
});

//Static for Login
user_schema.static.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("Password error");
  }
  throw Error("Incorrect email");
};

const user = mongoose.model("user", user_schema);

module.exports = user;
