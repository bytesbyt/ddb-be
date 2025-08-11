const orderController = {};
const Order = require("../models/Order");
const productController = require("./product.controller");
const randomStringGenerator = require("../utils/randomStringGenerator");

orderController.createOrder = async (req, res) => {
  try {
    // Get data sent from fe
    const { userId } = req
    const { totalPrice, shipTo, contactInfo, orderList } = req.body;

    
    // check stock and update stock
    const insufficientStockItems = await productController.checkItemListStock(orderList);
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce((total, item) => total + item.message + "\n", "");
      throw new Error(errorMessage);
    };

    // create order
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact:contactInfo,
      items: orderList,
      orderNum: randomStringGenerator(),
    });

    await newOrder.save();
    res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};


module.exports = orderController;