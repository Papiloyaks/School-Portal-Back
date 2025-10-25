// Bring in mongoose (to connect to MongoDB)
const mongoose = require("mongoose");
// Bring in bcrypt (to hash passwords)
const bcrypt = require("bcryptjs");

// ===============================
// 🔹 STUDENT SCHEMA
// ===============================
const studentSchema = new mongoose.Schema({
  dob: { type: String, required: true },            // Date of birth (string format)
  email: { type: String, required: true, unique: true }, // Must be unique
  firstname: { type: String, required: true },       // Student’s first name
  lastname: { type: String, required: true },        // Student’s last name
  password: { type: String, required: true },        // Password (will be hashed)
  phone: { type: String, required: true },           // Phone number
  date: { type: Date, default: Date.now },           // Automatically set to current date
  matric: { type: String, required: true },          // Student’s matric number
});

// ===============================
// 🔹 HELP SCHEMA
// ===============================
const helpSchema = new mongoose.Schema({
  subject: { type: String, required: true },   // The subject of the help request
  help: { type: String, required: true },      // The message or description
  helpTime: { type: String, required: true },  // Time of help
  helpDate: { type: String, required: true },  // Date of help
});

// ===============================
// 🔹 HASH PASSWORD BEFORE SAVING
// ===============================
studentSchema.pre("save", async function (next) {
  // If password wasn’t changed, skip hashing (important for updates)
  if (!this.isModified("password")) return next();

  try {
    // Generate a salt (random string) and hash the password
    const salt = await bcrypt.genSalt(10); // 10 = recommended salt rounds
    this.password = await bcrypt.hash(this.password, salt);
    next(); // Continue saving
  } catch (err) {
    next(err); // Stop if an error occurs
  }
});

// ===============================
// 🔹 VALIDATE PASSWORD WHEN LOGGING IN
// ===============================
studentSchema.methods.validatePassword = async function (password) {
  // Compare plain password with hashed one in the database
  return await bcrypt.compare(password, this.password);
};

// ===============================
// 🔹 CREATE MODELS (Collections)
// ===============================
const studentModel = mongoose.model("Student", studentSchema); // "students" collection
const helpModel = mongoose.model("Help", helpSchema);           // "helps" collection

// ===============================
// 🔹 EXPORT MODELS
// ===============================
module.exports = { studentModel, helpModel };
