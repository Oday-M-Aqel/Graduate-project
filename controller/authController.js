const jwt = require("jsonwebtoken");
const webPush = require("web-push");
const user = require("../nodejs/Database/models/users");
const Product = require("../nodejs/Database/models/products");
const reservation = require('../nodejs/Database/models/reservation');
const Order = require('../nodejs/Database/models/orders');
const { isStrongPassword } = require("validator");
const moment = require('moment-timezone');
const fs = require("fs");
const path = require("path");
let errors = { name: "", phone: "", email: "", password: "" };
const bcrypt = require("bcrypt");
const orders = require("../nodejs/Database/models/orders");
const maxAge = 1 * 24 * 60 * 60;
const secretKey = "OdayIsNerd";
// Notifications variable: vapid key
const publicVapidKey = 'BIfnXiQ8o1KKEM75QjeKg9Q16hA956r7RolBrUmbHnBcuBrk3Giyvk3sb2feXYiE9Vkk-ObPF9Nmf4DhG8J_Hfo';
const privateVapidKey = 'ZmtVuSTm9tMvIHMr0jkFvj5_crXS2gh7ci6blnBIiCo';

var userState;

const createToken = (id) => {
  return jwt.sign({ id }, secretKey, { expiresIn: maxAge });
};
module.exports.signup_get = (req, res) => {
  res.render("signup");
};
module.exports.login_get = (req, res) => {
  res.render("login");
};
module.exports.signup_post = async (req, res) => {
  const { name, phone, email, password } = req.body;
  try {
    const userFound = await user.findOne({email: email});
    if(userFound) {
      return res.status(409).json({message: "Email is already in use"})
    } else {
      const users = await user.create({ name, phone, email, password });
      const token = createToken(users._id);
      res
        .status(201)
        .cookie("jwt", token, { httpOnly: false, maxAge: maxAge * 1000 })
        .redirect("/home");
      }
  } catch (err) {``
    res.status(400).send(errors);
  }
};

module.exports.login_post = async (req, res) => {
  try {
    const check = await user.findOne({ email: req.body.email });
    if (!check) {
      res.status(500).json({ error: "the email or password is not correct. please try again"});
    } else {
      userState = check.status;
      const isPassMatch = await bcrypt.compare(
        req.body.password,
        check.password
      );
      if (isPassMatch && userState === "admin") {
        const token = createToken(check._id);
        res
          .status(201)
          .cookie("jwt", token, { httpOnly: false, maxAge: maxAge * 1000 })
          .json({state: "admin"});
      } else if (isPassMatch && userState === "user") {
        const token = createToken(check._id);
        res
          .status(201)
          .cookie("jwt", token, { httpOnly: false, maxAge: maxAge * 1000 })
          .json({state: "user"})
      } else {
        res.status(500).json({ error: "the email or password is not correct. please try again"});
      }
    }
  } catch (err) {
    res.status(500).send(err);
  }
};
module.exports.home_get = (req, res) => {
  res.render("home");
};
module.exports.switch_page = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return null;
    }
    const decodedToken = jwt.verify(token, secretKey);
    const userId = decodedToken.id;
    const users = await user.find({ _id: userId });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: "Error fetching products" });
  }
};

module.exports.menu_get = (req, res) => {
  res.render("menu");
};
module.exports.menu_data_get = async (req, res) => {
  try {
    let userData = null;
    const userId = getUserData(req);

    if (userId) {
      userData = await user.findById(userId);
    }

    const products = await Product.find();
    res.json({ user: userData, products });
  } catch (error) {
    res.status(500).json({ error: "Error fetching products and user data" });
  }
};
module.exports.dashboard_get = async (req, res) => {
  const userId = getUserData(req);
  const User = await user.findById(userId);
  if(!User){
    res.render("login");
  } else if (User.status === 'admin') {
    res.render("admin/dashboard");
  } else {
    res.render("home"); 
  }
};
module.exports.dashboard_get_data = async (req, res) => {
  try {
    const userId = getUserData(req);

    const U = await user.findById(userId);
    // Step 1: Find all accepted reservations
    const reservations = await reservation.find({ status: 'accepted' });
    
    // Step 2: Prepare an array to store formatted reservation data
    let reservationsForm = [];
    
    // Step 3: Loop through each reservation to fetch user data and format the output
    for (const reserve of reservations) {
      // Fetch user data using userId
      const userData = await user.findById(reserve.userId);
      // Format the reservation data with userName and userEmail
      const formattedReservation = {
        _id: reserve._id,
        userName: userData.name,
        userEmail: userData.email,
        resName: reserve.resName,
        resPhone: reserve.phone,
        newDate: reserve.newDate,
        numOfPersons: reserve.numPerson,
        details: reserve.details,
      };
      reservationsForm.push(formattedReservation);
    };
    // Step 2: Find users created in the last 24 hours
    const H24 = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentUsers = await user.find({ createdAt: { $gte: H24 } });
    // Step 3: Find orders created in the last 24 hours
    const recentOrders = await Order.find({ createdAt: { $gte: H24 }, status: "completed"});
    // Step 4: Calculate the total sales for all orders
    const totalSales = await Order.aggregate([
      {
        $match: { createdAt: { $gte: H24 } } // Filter to consider only recent orders
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalPrice' } // Summing totalPrice field for all matching orders
        }
      }
    ]);
    // Format totalSales to a number (0 if no orders found)
    const totalSalesAmount = totalSales.length > 0 ? totalSales[0].totalAmount : 0;

    const jData = {
      reserve: reservationsForm,
      recentUsers: recentUsers.length,
      recentOrders: recentOrders.length,
      totalSales: totalSalesAmount
    }
    // Step 5: Send the data in the response
    res.json(jData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dashboard data' });
  }
};

module.exports.admin_users_get = async (req, res) => {
  const userId = getUserData(req);
  const User = await user.findById(userId);
  if(!User){
    res.render("login");
  } else if (User.status === 'admin') {
    res.render("admin/users");
  } else {
    res.render("home"); 
  }
};
module.exports.users_data_get = async (req, res) => {
  try {
    const users = await user.find();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//this code takes all users needed

module.exports.products_post = async (req, res) => {
  const name = req.body["product-name"];
  const price = req.body["product-price"];
  const type = req.body["product-type"];
  const description = req.body["product-desc"];
  const image = {
    // '../Graduate-project/images/coffee.png'
    data: fs.readFileSync(
      path.join(process.cwd() + "/images/" + req.file.originalname)
    ),
    contentType: req.file.mimetype,
  };
  try {
    let prod = new Product({
      name: name,
      price: price,
      type: type,
      image: image,
      description: description,
    });
    await prod.save();
    res.redirect("products");
  } catch (err) {
    res.status(500).json({message: "Internal Server Error" + err})
  }
};

// Assuming you have already imported the required modules and defined the product schema

module.exports.edit_product = async (req, res) => {
  try {
    const productId = req.body.id;
    const name = req.body["product-name"];
    const price = req.body["product-price"];
    const type = req.body["product-type"];
    const description = req.body["product-desc"];
    const status = req.body.status;
    
    let image;
    if (req.file) {
      image = {
        data: fs.readFileSync(
          path.join(process.cwd() + "/images/" + req.file.originalname)
        ),
        contentType: req.file.mimetype,
      };
    }
    
    // Create an object with the fields to be updated
    const updates = {};
    if (image) updates.image = image;
    if (name) updates.name = name;
    if (price) updates.price = price;
    if (description) updates.description = description;
    if (type) updates.type = type;
    if (status) updates.status = status;
    
    // Update the product using findOneAndUpdate
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId },
      { $set: updates },
      { new: true } // To return the updated document
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.products_get = async (req, res) => {
  const userId = getUserData(req);
  const User = await user.findById(userId);
  if(!User){
    res.render("login");
  } else if (User.status === 'admin') {
    res.render("admin/products");
  } else {
    res.render("home"); 
  }
};

//this function to get data from database for products
module.exports.products_data_get = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: "Error fetching products" });
  }
};

module.exports.admin_profile_get = async (req, res) => {
  const userId = getUserData(req);
  const User = await user.findById(userId);
  if(!User){
    res.render("login");
  } else if (User.status === 'admin') {
    res.render("admin/profile");
  } else {
    res.render("home"); 
  }
};

function getUserData(req) {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(404).json({message: "User not found"});
    }
    const decodedToken = jwt.verify(token, secretKey);
    const userId = decodedToken.id;
    return userId;
  } catch (err) {
    return null;
  }
}


// async function getProduct(req) {
//   try {
//     const productId = req.params.productId || req.body.productId;
//     if (!productId) {
//       return null;
//     }
//     const product = await Product.findById(productId);
//     if (!product) {
//       return null;
//     }
//     return product;
//   } catch (err) {
//     console.error("Error fetching product data:", err);
//     return null;
//   }
// }


module.exports.admin_profile_get_api = async (req, res) => {
  try {
    const userId = getUserData(req);
    const userData = await user.findById(userId);
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.logout_Del_Cookie = async (req, res) => {
  res.clearCookie("jwt").send("Logout Successfully");
};

module.exports.delete_product_id = async (req, res) => {
  try {
    const Id = req.body.id;
    const result = await Product.findByIdAndDelete(Id);
    if (!result) {
      return res.status(404).send("Product not found");
    }
    res.send("Product deleted successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};
module.exports.delete_user_email = async (req, res) => {
  try {
    const userEmail = req.body.email;
    const result = await user.findOneAndDelete({ email: userEmail });
    if (!result) {
      return res.status(404).send("user not found");
    }
    res.send("user deleted successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

module.exports.update_data = async (req, res) => {
  try {
    const email = req.body.email;
    user
      .findOne({ email: email })
      .then((usr) => {
        user
          .update(usr._id, req.body)
          .then((users) => {
            res.json(users);
          })
          .catch((err) => {
            res.send(err);
          });
      })
      .catch((err) => {        
        res.status(404).json({message: "Can't find user"});
      });
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports.update_user_data = async (req, res) => {
  try {
    const email = req.body.email;
    const updatedUser = await user.findOneAndUpdate(
      { email: email },
      { $set: { name: req.body.name, status: req.body.status } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

async function checkPass(userId, oldPassword) {
  const userDoc = await user.findById(userId);
  if (!userDoc) {
    return false;
  }
  const isMatch = await bcrypt.compare(oldPassword, userDoc.password);
  return isMatch;
}

module.exports.update_profile_data = async (req, res) => {
  try {
    const userId = getUserData(req);
    const { name, email, phone } = req.body;
    const newPassword = req.body.newPassword.trim();
    
    if (newPassword !== '') {
      if (!isStrongPassword(newPassword)) {
        return res.status(400).json({ error: "New Password is not strong enough. It must contain at least 8 characters, including uppercase, lowercase, number, and special character." });
      }

      const oldPassword = req.body.oldPassword;
      const isPasswordCorrect = await checkPass(userId, oldPassword);
      if (!isPasswordCorrect) {
        return res.status(400).json({ error: "Old password is incorrect, Please try again" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const updatedUser = await user.findOneAndUpdate(
        { _id: userId },
        { $set: { name: name, email: email, phone: phone, password: hashedPassword } },
        { new: true }
      );
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(200).json(updatedUser);
    } else {
      if (!name) {
        return res.status(400).json({ error: "Name field is empty, please enter name" });
      }
      if (!email) {
        return res.status(400).json({ error: "Email field is empty, please enter email" });
      }
      if (!phone) {
        return res.status(400).json({ error: "Phone field is empty, Please enter a phone number" });
      }
      const foundedEmail = await user.findOne({ email: email });
      if (foundedEmail && foundedEmail._id.toString() !== userId) {
        return res.status(409).json({ error: "Email is already used, please try another email" });
      }
      const updatedUser = await user.findOneAndUpdate(
        { _id: userId },
        { $set: { name: name, email: email, phone: phone } },
        { new: true }
      );
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(200).json(updatedUser);
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.delete_loggedIn_user = async (req, res) => {
  try {
    const userEmail = req.body.email;
    const userToDelete = await user.findOne({ email: userEmail });
    
    if (!userToDelete) {
      return res.status(404).send("User not found");
    }

    // Delete associated orders
    await Order.deleteMany({ userId: userToDelete._id });

    // Delete associated reservations
    await reservation.deleteMany({ userId: userToDelete._id });

    // Delete the user
    await user.findByIdAndDelete(userToDelete._id);

    res.clearCookie("jwt").send("Deleted Successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

module.exports.messages_get = async (req, res) => {
  const userId = getUserData(req);
  const User = await user.findById(userId);
  if(!User){
    res.render("login");
  } else if (User.status === 'admin') {
    res.render("admin/messages");
  } else {
    res.render("home"); 
  }
}


module.exports.user_profile_get = async (req, res) => {
  const userId = getUserData(req);
  const User = await user.findById(userId);
  if(!User){
    res.render("login");
  } else if (User.status === 'user') {
    res.render("user/profile");
  } else {
    res.render("home"); 
  }
}

module.exports.user_reservation_get = async (req, res) => {
  const userId = getUserData(req);
  const User = await user.findById(userId);
  if(!User){
    res.render("login");
  } else if (User.status === 'user') {
    res.render("user/reservation");
  } else {
    res.render("home");
  }
}

module.exports.reservation_get = (req, res) => {
  res.render('reservation');
}

module.exports.reservation_post = async (req, res) => {
  try {
  const userId = getUserData(req);
    
    if (!userId) {
      return res.status(404).json({ error: "User not found. Please log in before making a reservation." });
    }
    const userData = await user.findById(userId);
    if (userData.status === 'admin') { // Assuming user roles are defined, and admin is one of them
      return res.status(403).json({ error: "You are an admin. Admins cannot make reservations." });
    }

    const { name, phone, numOfPersons, insDate, details } = req.body;
    if (!name || !phone || !numOfPersons || !insDate) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    const alreadyReserved = await reservation.findOne({ 
      userId: userId,
      status: { "$in": ["pending", "accepted"] },
     });

    if (alreadyReserved) {
      return res.status(400).json({ error: "You already have a reservation. Please wait until the current reservation ends before making another one." });
    }
    
    const reservationDate = moment.tz(insDate, "UTC").tz("Etc/GMT-3").toDate();
    const newReservation = new reservation({
      userId: userId,
      resName: name,
      phone: phone,
      numPerson: numOfPersons,
      newDate: reservationDate,
      details: details || "No details",
    });
    
    await newReservation.save();
    res.status(201).json({ message: "Reservation created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.user_profile_get_api = async (req, res) => {
  try {
    const userId = getUserData(req);
    const userData = await user.findById(userId);
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports.checkOut = async (req, res) => {
  try {
    const userId = getUserData(req);
    const userData = await user.findById(userId);

    if (!userData) {
      return res.status(404).json({ message: "Can't find user, please Login" });
    }

    if (userData.status === "admin") {
      return res.status(403).json({ message: "Admins cannot make checkouts" });
    }
    res.render('check-out');
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports.checkOut_post = async (req, res) => {
  try {
    const userId = getUserData(req);
    const now = new Date();
    const userData = await user.findById(userId);
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const { customer, cart, pM } = req.body;
    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    if (userData.status === 'admin') {
      return res.status(403).json({ error: "Admins cannot make orders" });
    }

    if (!customer || !customer.name || !customer.phone || !customer.City || !customer.address1) {
      return res.status(400).json({ error: "Customer information is incomplete" });
    }

    const oneMinutesAgo = new Date(now.getTime() - 1 * 60 * 1000);
    const recentOrder = await Order.findOne({ userId: userId, createdAt: { $gte: oneMinutesAgo }, status:"pending" }).exec();
    if (recentOrder) {
      return res.status(429).json({ error: "You can only place an order every one minute" });
    }
    let totalPrice = 0;
    const products = await Promise.all(cart.map(async item => {
      const product = await Product.findById(item.id).exec();
      if (!product) {
        throw new Error(`Product with ID ${item.id} not found`);
      }
      
      totalPrice += product.price * item.quan;
      let neededScore = totalPrice * 50;
      if (pM === "Score") {
        if (neededScore <= userData.score) {
          const updatedUser = await user.findByIdAndUpdate(
            userId,
            { $inc: { score: -neededScore } },
            { new: true }
          );
          if (!updatedUser) {
            throw new Error("Failed to update user's score.");
          }
        } else {
          return res.status(400).json({ error: "You don't have enough score." });
        }
      }
      return {
        productId: item.id,
        quantity: item.quan,
      };
    }));
    
    const gmtPlus3 = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    const orderData = {
      userId: userId,
      customer: {
        name: customer.name,
        phone: customer.phone,
        City: customer.City,
        address1: customer.address1,
        address2: customer.address2 || "",
      },
      products: products,
      totalPrice: totalPrice,
      createdAt: gmtPlus3,
      paymentType: pM,
    };
    
    const newOrder = new Order(orderData);
    await newOrder.save();



    res.status(201).json({ message: "Order created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};

module.exports.messages_data_get = async (req, res) => {
  try {
    const adminId = getUserData(req);
    const admin = await user.findById(adminId)
    if(!admin) {
      return res.status(404).json({ message: "1" })
    }
    const reservations = await reservation.find({ status: "pending" });
    if(reservations.length === 0) {
      return res.status(404).json({ message: "2" })
    }
    const usersData = [];
    
    reservations.forEach((data) => {
      usersData.push(user.findById(data.userId));
    });

    const userDataList = await Promise.all(usersData);
    const Reservations = [];
    if(userDataList.length === 0) {
      return res.status(404).json({ message: "3" })
    }
    reservations.forEach((data, index) => {
      const users = userDataList[index];
      if (users) {
        Reservations.push({
          userName: users.name,
          userEmail: users.email,
          reservationId: data._id,
          resName: data.resName,
          phone: data.phone,
          reserveDate: data.newDate,
          numPerson: data.numPerson,
          details: data.details
        });
      }
    });
    res.status(200).json(Reservations);
  } catch (err) {
    res.status(500).json({ message: "4" });
  }
};


module.exports.message_acc_rej_com = async (req, res) => {
  try {
    const { id, status, message } = req.body;
    if (!['accepted', 'rejected', 'completed', 'pending'].includes(status)) {
      return res.status(400).json({ error: "Invalid state value" });
    }

    const updateFields = { status: status };
    
    if (status === 'rejected' && message) {
      updateFields.message = message;
    }

    const updatedReservation = await reservation.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    if (!updatedReservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    if (status === 'completed') {
      const userId = updatedReservation.userId;
      await user.findByIdAndUpdate(
        userId,
        { 
          $inc: { 
            reservationNumbers: 1,
            score: 20,
          }
        },
        { new: true }
      );
    }

    res.status(200).json({ message: "Reservation updated successfully", reservation: updatedReservation });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.getOrders = async (req, res) => {
  const userId = getUserData(req);
  const User = await user.findById(userId);
  if(!User){
    res.render("login");
  } else if (User.status === 'admin') {
    res.render("admin/orders");
  } else {
    res.render("home"); 
  }
};

module.exports.get_orders_data = async (req, res) => {
  try {
    // Fetch all pending orders
    const orders = await Order.find({ status: "pending" });
    if(orders.length === 0) {
      return res.status(404).json({ message: "1" });
    }
    // Process each order to get user and product information
    const ordersData = await Promise.all(orders.map(async order => {
      // Fetch user information
      const User = await user.findById(order.userId).exec();
      if (!User) {
        return res.status(404).json({ message: "2" });
      }

      // Fetch product information
      const products = await Promise.all(order.products.map(async productItem => {
        const product = await Product.findById(productItem.productId).exec();
        if (!product) {
          return res.status(404).json({ message: "3" });
        }
        return {
          productId: product._id,
          productName: product.name,
          quantity: productItem.quantity
        };
      }));

      // Construct order data with user and product information
      return {
        orderId: order._id,
        userName: User.name,
        userEmail: User.email,
        userScore: User.score,
        customer: order.customer,
        products: products,
        totalPrice: order.totalPrice,
        scores: order.totalPrice,
        createdAt: order.createdAt
      };
    }));

    // Send the combined data back to the client
    res.status(200).json({ orders: ordersData });
  } catch (err) {
    res.status(500).json({ message: "4" });
  }
};

webPush.setVapidDetails('mailto:ooday2424@gmail.com', publicVapidKey, privateVapidKey);

module.exports.subscription_post = (req, res) => {
    const subscription = req.body;
    res.status(201).json({});

    // Create payload
    const payload = JSON.stringify({ 
        title: 'Push Test',
        body: 'This is a test push notification',
        icon: 'http://image.ibb.co/frYOFD/tmlogo.png' 
    });
    webPush.sendNotification(subscription, payload).catch(err => console.error(err));
};

module.exports.user_dashboard_get = async (req, res) => {
  const userId = getUserData(req);
  const User = await user.findById(userId);
  if(!User){
    res.render("login");
  } else if (User.status === 'user') {
    res.render("user/dashboard");
  } else {
    res.render("home"); 
  }
}

module.exports.get_user_orders = async (req, res) => {
  const userId = getUserData(req);
  const User = await user.findById(userId);
  if(!User){
    res.render("login");
  } else if (User.status === 'user') {
    res.render("user/orders");
  } else {
    res.render("home"); 
  }
};

module.exports.get_user_messages = async (req, res) => {
  try {
    // Get the userId from the request
    const userId = getUserData(req);

    // Fetch the user data
    const userData = await user.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: "1" });
    }

    // Search for reservations by userId
    const userReservations = await reservation.find({ userId: userId });

    // Check if reservations exist for the user
    if (userReservations.length === 0) {
      return res.status(404).json({ message: "2" });
    }

    // Format the reservations data with user details
    const reservationsForm = userReservations.map(data => ({
      userName: userData.name,
      userEmail: userData.email,
      reservationId: data._id,
      resName: data.resName,
      phone: data.phone,
      reserveDate: data.newDate,
      numPerson: data.numPerson,
      details: data.details,
      status: data.status,
      RejMessage: data.message
    }));
    // Send the formatted reservations in the response
    res.status(200).json(reservationsForm);
  } catch (err) {
    res.status(500).json({ message: "3" });
  }
};

module.exports.get_orders_user_data = async (req, res) => {
  try {
    // Get the userId from the request
    const userId = getUserData(req);
    
    // Fetch the user data
    const userData = await user.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: "1" });
    }
    
    // Fetch the orders for the user
    const userOrders = await Order.find({ userId: userId });
    if (userOrders.length === 0) {
      return res.status(404).json({ message: "2" });
    }
    // Fetch product details for each order
    const ordersData = await Promise.all(userOrders.map(async (order) => {
      const products = await Promise.all(order.products.map(async (product) => {
        const productData = await Product.findById(product.productId);
        return {
          productName: productData.name,
          quantity: productData.quantity
        };
      }));
      // console.log(order);
      return {
        userName: userData.name,
        userEmail: userData.email,
        orderId: order._id,
        orderName: order.customer.name,
        orderPhone: order.customer.phone,
        city: order.customer.City,
        address1: order.customer.address1,
        address2: order.customer.address2,
        products,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        status: order.status,
      };
    }));
    res.status(200).json(ordersData);
  } catch (err) {
    console.error(`Error processing order: ${err.message}`);
    res.status(500).json({ message: "3" });
  }
};

module.exports.user_dashboard_post = async (req, res) => {
  try {
    const userId = getUserData(req);
    const userData = user.findById(userId);
    const userOrders = await orders.find({userId: userId});
    let userOrdersLen;
    if(userOrders.length == 0){
      userOrdersLen = 0;
    } else {
      userOrdersLen = userOrders.length;
    }
    const jData = {
      userScore: userData.score,
      ordersNumber: userOrdersLen,
      userCreate: userData.createdAt
    };
    res.json(jData);
  } catch (err) {
    res.json(err);
  }
};

module.exports.deleteReservation = async (req, res) => {
  try {
    const reservationId = req.body.id; // Assuming the reservation ID is passed as a URL parameter

    // Attempt to delete the reservation
    const deletedReservation = await reservation.findByIdAndDelete(reservationId);

    if (!deletedReservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    res.status(200).json({ message: "Reservation deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.finishedOrders = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const order = await Order.findById(orderId);
    const IncreasedScore = order.totalPrice;
    // Find and update the order status
    const orderData = await Order.findByIdAndUpdate(
      orderId,
      { status: 'completed', $inc: {scores: IncreasedScore}},
      { new: true }
    );

    // Check if order was found
    if (!orderData) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If payment method is Cash, update the user's score
    if (orderData.paymentType === 'Cash') {
      // Find and update the user's score
      const updatedUser = await user.findByIdAndUpdate(
        order.userId,
        { $inc: { score: IncreasedScore } },
        { new: true }
      );
      await user.findByIdAndUpdate(
        order.userId,
        { $inc: { orderNumbers: 1 } },
        { new: true }
      );

      // Check if user was found
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
    }
    // Send success response
    res.status(200).json({ message: "Order updated successfully", order: orderData });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports.checkEmail = async (req, res) => {
  const newEmail = req.body.email;
  const User = await user.findOne({email: newEmail});
  if(User) {
    return res.json({message: "exist"});
  } else { 
    return res.json({message: "not exist"})
  }
}

module.exports.get_user_statics = async (req, res) => {
  const userId = getUserData(req);
  const userData = await user.findById(userId);
  if(userData){
    return res.json({
      name: userData.name,
      Score: userData.score,
      tOrders: userData.orderNumbers,
      tReservations: userData.reservationNumbers,
    });
  } else {
    res.status(404).json("there is something error");
  }
}

module.exports.checkout_data = async (req, res) => {
  try {
    const userData = await user.findById(getUserData(req));
    res.status(200).json({
      score: userData.score,
    })
  } catch (error) {
    
  }
};

module.exports.storeName = async (req, res) => {
  try {
    const userId = getUserData(req);
    const userData = await user.findById(userId);
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ name: userData.name });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

