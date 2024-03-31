const jwt = require("jsonwebtoken");
require('dotenv').config();

const secretKey=process.env.SECRET_KEY
function generateToken(user) {
    const token =  jwt.sign(user, secretKey, { expiresIn: "1h" });
    return token;
}
function verifyToken(req,res,next) {
    
    const token = req.headers["authorization"];
  
    if (!token) {
        res.end(JSON.stringify({ message: 'Unauthorized access: No token provided' }));
        res.status=401;
        return 
    }
  
    jwt.verify(token, secretKey, (err) => {
      if (err) {
        res.end(JSON.stringify({ message: 'Unauthorized access: Invalid token' }));
        res.status=401;
        return 
      }
      next();
    });
  }
module.exports = { generateToken , verifyToken };
