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
  bearerToken= bearerToken.split(" ");
  const token=bearerToken[1];
  if (!token) {
    message.sendErrorResponse(
      res,
      401,
      "Unauthorized access:No token provided"
    );
    return;
  }

  jwt.verify(token, secretKey, (err,decoded) => {
    
    if (err) {
      message.sendErrorResponse(
        res,
        401,
        "Unauthorized access:invalid token"
      );
      return;
    }
    req.user=decoded;
    next();
  });
}
module.exports = { generateToken, verifyToken };
