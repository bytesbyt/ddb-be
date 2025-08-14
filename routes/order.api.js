const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const orderController = require("../controllers/order.controller");

router.post("/", authController.authenticate, orderController.createOrder);
router.get("/list", authController.authenticate, authController.checkAdminPermission, orderController.getOrderList);
router.get("/", authController.authenticate, orderController.getOrder);
router.put("/:id", authController.authenticate, authController.checkAdminPermission, orderController.updateOrderStatus);

module.exports = router;