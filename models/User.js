const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    default: "customer",
  },
}, { timestamps: true });
userSchema.methods.toJSON = function() {
    const obj = this._doc
    delete obj.password
    delete obj.__v
    delete obj.createdAt
    delete obj.updatedAt
    return obj
}

const User = mongoose.model("User", userSchema);
module.exports = User;