const Product = require("../models/Product");
const PAGE_SIZE = 4;
const productController = {};

productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;
    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    });
    await product.save();
    res.status(200).json({
      status: "success",
      product,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.sku) {
      return res.status(400).json({
        status: "fail",
        error: "This SKU already exists. Please use a different SKU.",
      });
    }
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.getProducts = async (req, res) => {
  try {
    const { page, name } = req.query;

    const cond = name
      ? { name: { $regex: name, $options: "i" }, isDeleted: false }
      : { isDeleted: false };
    let query = Product.find(cond);
    let response = { status: "success" };

    // Always calculate totalPageNum
    const totalItemNum = await Product.find(cond).countDocuments();
    const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
    response.totalPageNum = totalPageNum;

    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
    }

    const productList = await query.exec();
    response.data = productList;
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      name,
      sku,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      {
        name,
        sku,
        size,
        image,
        category,
        description,
        price,
        stock,
        status,
      },
      { new: true }
    );
    if (!product) throw new Error("Product not found");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.sku) {
      return res.status(400).json({
        status: "fail",
        error: "This SKU already exists. Please use a different SKU.",
      });
    }
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findOne({ _id: productId, isDeleted: false });
    if (!product) throw new Error("Product not found");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { isDeleted: true },
      { new: true }
    );
    if (!product) throw new Error("Product not found");
    res
      .status(200)
      .json({ status: "success", message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.checkStock = async (item) => {
  // product info
  const product = await Product.findById(item.productId);

  if (!product) {
    console.error(`Product not found with ID: ${item.productId}`);
    return { isVerified: false, message: `Product not found` };
  }

  // compare stock and qty
  if (!product.stock || product.stock[item.size] === undefined) {
    return {
      isVerified: false,
      message: `Size ${item.size} not available for ${product.name}`,
    };
  }

  if (product.stock[item.size] < item.qty) {
    // if no stock, return false
    return {
      isVerified: false,
      message: `Insufficient stock for ${product.name} ${item.size}`,
    };
  }

  // Only return verification status
  return { isVerified: true, product };
};

productController.checkItemListStock = async (itemList) => {
  const insufficientStockItems = [];
  const verifiedItems = [];

  // Check all items without modifying stock
  await Promise.all(
    itemList.map(async (item) => {
      const stockCheck = await productController.checkStock(item);
      if (!stockCheck.isVerified) {
        insufficientStockItems.push({ item, message: stockCheck.message });
      } else {
        verifiedItems.push({ item, product: stockCheck.product });
      }
      return stockCheck;
    })
  );

  // If any item has insufficient stock, return error without modifying any stock
  if (insufficientStockItems.length > 0) {
    return insufficientStockItems;
  }

  // Only if ALL items have sufficient stock, reduce stock for all items
  await Promise.all(
    verifiedItems.map(async ({ item, product }) => {
      const newStock = { ...product.stock };
      newStock[item.size] -= item.qty;
      product.stock = newStock;
      await product.save();
    })
  );
  // Empty array if all items verified
  return insufficientStockItems;
};

module.exports = productController;
