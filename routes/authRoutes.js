const { Router } = require("express");
const authController = require("../controller/authController");
const { isLoggedIn, upload } = require("../middleware/authMiddlewares");
const router = Router();

// signup links
router.get("/signup", isLoggedIn, authController.signup_get);
router.post("/signup", authController.signup_post);
router.post("/signup/api", authController.checkEmail);

// login links
router.get("/login", isLoggedIn, authController.login_get);
router.post("/login", authController.login_post);

// home links
router.get("/home", authController.home_get);
router.get("/home/api", authController.switch_page);

// menu links
router.get("/menu", authController.menu_get);
router.get("/menu/api", authController.menu_data_get);
router.get("/menu/",  authController.switch_page);
router.get("/checkout",  authController.checkOut);
router.get("/checkout/switch", authController.switch_page);
router.post("/menu/checkout", authController.checkOut_post);
router.post("/checkout", authController.checkout_data);

// dashboard admin links
router.get("/admin/dashboard", authController.dashboard_get);
router.get("/admin/dashboard/api", authController.dashboard_get_data);
router.put("/admin/dashboard", authController.message_acc_rej_com);
router.delete("/admin/dashboard/delete", authController.deleteReservation);

//users admin links
router.get("/admin/users", authController.admin_users_get);
router.get("/admin/users/api", authController.users_data_get);
router.delete("/admin/users", authController.delete_user_email); //this for delete user.

// products for admin links
router.get("/admin/products", authController.products_get);
router.get("/admin/products/api", authController.products_data_get);
router.post("/admin/products", upload.single("product-image"), authController.products_post);
router.delete("/admin/products", authController.delete_product_id);
router.put("/admin/products", upload.single("choose-file"), authController.edit_product);

// logout admin dashboards
router.post("/admin/dashboard/logout", authController.logout_Del_Cookie);
router.post("/admin/users/logout", authController.logout_Del_Cookie);
router.post("/admin/messages/logout", authController.logout_Del_Cookie);
router.post("/admin/product/logout", authController.logout_Del_Cookie);
router.post("/admin/profile/logout", authController.logout_Del_Cookie);
router.post("/admin/orders/logout", authController.logout_Del_Cookie);

// admin profile links
router.get("/admin/profile", authController.admin_profile_get);
router.get("/admin/profile/api", authController.admin_profile_get_api);
router.put("/admin/profile", authController.update_profile_data);
router.delete("/admin/profile", authController.delete_loggedIn_user);

// admin messages
router.get("/admin/messages", authController.messages_get);
router.get("/admin/messages/api", authController.messages_data_get);
router.put("/admin/messages", authController.message_acc_rej_com);

router.get("/reservation", authController.reservation_get);
router.get("/reservation/api", authController.switch_page);
router.post("/reservation", authController.reservation_post);

// logout user dashboards
router.post("/user/profile/logout", authController.logout_Del_Cookie);
router.post("/user/reservation/logout", authController.logout_Del_Cookie);
router.post("/user/orders/logout", authController.logout_Del_Cookie);
router.post("/user/dashboard/logout", authController.logout_Del_Cookie);

// user profile links
router.get("/user/profile", authController.user_profile_get);
router.get("/user/messages", authController.user_reservation_get);
router.put("/user/profile", authController.update_profile_data);
router.delete("/user/profile", authController.delete_loggedIn_user);
router.get("/user/profile/api", authController.user_profile_get_api);
router.get("/user/orders", authController.get_user_orders);
router.get("/user/messages/api", authController.get_user_messages);
router.get("/user/orders/api", authController.get_orders_user_data);
router.get("/user/dashboard", authController.user_dashboard_get);
router.get("/user/dashboard/api", authController.get_user_statics);

router.get("/admin/orders", authController.getOrders);
router.get("/admin/orders/api", authController.get_orders_data);
router.put("/admin/orders", authController.finishedOrders);

router.get('/getUserName', authController.storeName)
module.exports = router;
