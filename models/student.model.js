const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 🔹 Define Student schema
const studentSchema = new mongoose.Schema({
  dob: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: Date, default: Date.now },
  matric: { type: String, required: true },
});

// 🔹 Define Help schema
const helpSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  help: { type: String, required: true },
  helpTime: { type: String, required: true },
  helpDate: { type: String, required: true },
});

// 🔹 Hash password before save
const saltRound = 5;
studentSchema.pre("save", function (next) {
  bcrypt.hash(this.password, saltRound, (err, hashedPassword) => {
    if (err) {
      console.log(err);
      next(err);
    } else {
      this.password = hashedPassword;
      next();
    }
  });
});

// 🔹 Add method for password validation
studentSchema.methods.validatePassword = function (password, callback) {
  bcrypt.compare(password, this.password, (err, same) => {
    callback(err, same);
  });
};

// 🔹 Create models
const studentModel = mongoose.model("Signup", studentSchema);
const helpModel = mongoose.model("Help", helpSchema);

// 🔹 Export
module.exports = { studentModel, helpModel };
