const Product = require("../models/Product");
const PAGE_SIZE=5;
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
        error: "This SKU already exists. Please use a different SKU." 
      });
    }
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.getProducts = async (req, res) => {
  try {
    const {page,name} = req.query;
    console.log("Request query params:", req.query);
    console.log("Page param:", page, "Type:", typeof page);
    
    const cond = name? {name:{$regex:name, $options:"i"}} : {};
    let query = Product.find(cond);
    let response = { status: "success"};

    // Always calculate totalPageNum
    const totalItemNum = await Product.find(cond).countDocuments();
    const totalPageNum = Math.ceil(totalItemNum/PAGE_SIZE);
    response.totalPageNum = totalPageNum;
    console.log("Total items:", totalItemNum, "Total pages:", totalPageNum);

    if (page) {
      query.skip((page-1)*PAGE_SIZE).limit(PAGE_SIZE);
    }

    const productList = await query.exec();
    response.data = productList;
    console.log("Final response being sent:", JSON.stringify(response, null, 2));
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = productController;
