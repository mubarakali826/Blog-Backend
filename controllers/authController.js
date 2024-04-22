const { createUser, findUserByEmail } = require("../models/User");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/token");
const message = require("../helpers/message");

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return message.sendErrorResponse(res, 400, "Please fill the required fields");
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return message.sendErrorResponse(res, 400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = await generateToken({ email });

    await createUser({ username, email, password: hashedPassword });

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

    const user = await findUserByEmail(email);

    if (!user) {
      return message.sendErrorResponse(res, 401, "Invalid email or password");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return message.sendErrorResponse(res, 401, "Invalid email or password");
    }

    const token = await generateToken({ email });
    res.setHeader("Authorization", `${token}`);

    return message.sendSuccessResponse(res, 'Logged in successfully', { user_data: { email }, token });
  } catch (error) {
    console.error("Error logging in user:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};
