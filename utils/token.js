const jwt = require("jsonwebtoken");
require("dotenv").config();
const message = require("../helpers/message");

const secretKey = process.env.SECRET_KEY;
function generateToken(user) {
  const token = jwt.sign(user, secretKey, { expiresIn: "1h" });
  return token;
}
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    message.sendErrorResponse(
      res,
      401,
      "Unauthorized access:No token provided"
    );
    return;
  }

  jwt.verify(token, secretKey, (err) => {
    if (err) {
      message.sendErrorResponse(
        res,
        401,
        "Unauthorized access:invalid token"
      );
      return;
    }
    next();
  });
}
module.exports = { generateToken, verifyToken };
