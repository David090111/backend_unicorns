
const mongoose = require("mongoose");

const unicornsdb = new mongoose.Schema({
  name: String,
  dob: Date,
  loves: [String],
  weight: Number,
  gender: String,
  vampires: Number,
});

module.exports = mongoose.model("Unicorn", unicornsdb);
