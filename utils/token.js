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
      res.writeHead(401, { 'Content-Type': 'text/json' })
      res.end(JSON.stringify({message:'Unauthorized access:No token provided'}))
      return 
    }
  
    jwt.verify(token, secretKey, (err) => {
      if (err) {
        res.writeHead(401, { 'Content-Type': 'text/json' })
        res.end(JSON.stringify({message:'Unauthorized access: Invalid token'}))
        return 
      }
      next();
    });
  }
module.exports = { generateToken , verifyToken };
