const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/token");
const message = require("../helpers/message");
const User = require('../models/User'); // Import the Mongoose User model

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return message.sendErrorResponse(res, 400, "Please fill the required fields");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return message.sendErrorResponse(res, 400, "User already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user using the Mongoose User model
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Generate token
    const token = await generateToken({ email });
    res.setHeader("Authorization", `${token}`);
    // Send response
    return message.sendCustomResponse(res, 201, { message: 'User created successfully', user_data: { username, email }, token });
  } catch (error) {
    console.error("Error signing up user:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return message.sendErrorResponse(res, 400, "Please fill the required fields");
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return message.sendErrorResponse(res, 401, "Invalid email or password");
    }
    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return message.sendErrorResponse(res, 401, "Invalid email or password");
    }

    // Generate token
    const token = await generateToken({ email });
    res.setHeader("Authorization", `${token}`);

    // Send success response
    return message.sendSuccessResponse(res, 'Logged in successfully', { user_data: { email }, token });
  } catch (error) {
    console.error("Error logging in user:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};
