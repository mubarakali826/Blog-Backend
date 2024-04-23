const jwt = require("jsonwebtoken");
require("dotenv").config();
const message = require("../helpers/message");

const secretKey = process.env.SECRET_KEY;

function generateToken(user) {
  const token = jwt.sign(user, secretKey, { expiresIn: "1782517625d" });
  return token;
}

function verifyToken(req, res, next) {
  let bearerToken = req.headers["authorization"];
  if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
    return message.sendErrorResponse(
      res,
      401,
      "Unauthorized access: No token provided"
    );
  }

  const token = bearerToken.split(" ")[1];
  
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return message.sendErrorResponse(
        res,
        401,
        "Unauthorized access: Invalid token"
      );
    }
    req.user = decoded;
    next();
  });
}

module.exports = { generateToken, verifyToken };
