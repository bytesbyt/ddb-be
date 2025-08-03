const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require('cors')
const indexRouter = require("./routes");
const app = express();

require("dotenv").config();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // req.body가 객체로 인식이 됩니다.

app.use("/api", indexRouter);

const mongoURI = process.env.MONGODB_URI_PROD || process.env.LOCAL_DB_ADDRESS;

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB connection fail", err));

app.listen(process.env.PORT || 5002, () => {
  console.log("Server On")
})

