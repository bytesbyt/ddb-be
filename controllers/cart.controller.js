const Cart = require("../models/Cart");
const cartController = {};

cartController.addItemToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;
    // Add item to cart
    // if user has no cart, create new cart
    // if user have item in cart
    //if yes, return error (already in cart)
    // find cart with userId
    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = new Cart({ userId });
        await cart.save();
    }
    // if user have item in cart? productId, size
    const existItem = cart.items.find((item) => item.productId.equals(productId) && item.size === size);
    if (existItem) {
        throw new Error("Item already in cart");
    }
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();
    res.status(200).json({ status: "success", data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.getCart = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    res.status(200).json({ status: "success", data: cart?.items || [] });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.getCartQty = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId });
    const qty = cart ? cart.items.length : 0;
    res.status(200).json({ status: "success", qty });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.deleteCartItem = async (req, res) => {
  try {
    const { userId } = req;
    const { id } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error("Cart not found");
    }
    cart.items = cart.items.filter((item) => !item._id.equals(id));
    await cart.save();
    res.status(200).json({ status: "success", cartItemQty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.updateCartItemQty = async (req, res) => {
  try {
    const { userId } = req;
    const { id } = req.params;
    const { qty } = req.body;
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    if (!cart) {
      throw new Error("Cart not found");
    }
    const item = cart.items.find((item) => item._id.equals(id));
    if (!item) {
      throw new Error("Item not found in cart");
    }
    item.qty = qty;
    await cart.save();
    res.status(200).json({ status: "success", data: cart.items });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = cartController;