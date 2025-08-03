const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { corsMiddleware } = require("./config/cors.config");
const indexRouter = require("./routes");
const app = express();

require("dotenv").config();

const MONGODB_URI_PROD = process.env.MONGODB_URI_PROD;


// Apply CORS middleware
app.use(corsMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use("/api", indexRouter);

const mongoURI = process.env.MONGODB_URI_PROD || process.env.LOCAL_DB_ADDRESS;

// Mongoose connection options for production
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose
  .connect(mongoURI, mongooseOptions)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB connection fail", err));

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

