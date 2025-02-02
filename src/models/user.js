const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: String,
  emailId: {
    type: String,
    required: true,
    unique: true
  },
  password: String,
  age: {
    type: Number,
    min:18
  },
  gender: String
});

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;