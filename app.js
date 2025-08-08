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

const mongoURI = process.env.MONGODB_URI_PROD
//const mongoURI = process.env.LOCAL_DB_ADDRESS


console.log("Connecting to MongoDB:", mongoURI);
mongoose
  .connect(mongoURI) 
  .then(() => console.log("MongoDB connected to:", mongoURI))
  .catch((err) => console.log("DB connection fail", err));

const PORT = process.env.PORT || 8080 || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

