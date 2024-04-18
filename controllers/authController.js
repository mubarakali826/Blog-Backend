const { createUser, findUserByEmail } = require("../models/User");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/token");
const message=require("../helpers/message")

exports.signup = async (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      let parsedBody;
      try {
        parsedBody = JSON.parse(body);
      } catch (error) {
        message.sendErrorResponse(res,400,"Invalid entry") 
        return;
      }
      const { username, email, password } = parsedBody;
      if (!username || !email || !password) {
        message.sendErrorResponse(res,400,"Please fill the required fields") 
        return;
      }
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
      message.sendErrorResponse(res,400,"User already exists") 
      return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const token = await generateToken(parsedBody);
      res.setHeader("Authorization", `${token}`);

      await createUser({ username, email, password: hashedPassword });
      message.sendCustomResponse(res, 201, {message:'user created successfully',user_data:parsedBody,token});
      
    } catch (error) {
      console.error("Error signing up user:", error);
      message.sendErrorResponse(res,500,"internal server error")
      return;
    }
  });
};

exports.login = async (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      let parsedBody;
      try {
        parsedBody = JSON.parse(body);
      } catch (error) {
         message.sendErrorResponse(res,400,"Invalid entry")
        return;
      }
      const { email, password } = parsedBody;
      if (!email || !password) {
        message.sendErrorResponse(res,400,"please fill the required fields")
        return;
      }

      const user = await findUserByEmail(email);

      if (!user) {
        message.sendErrorResponse(res,401,"invalid email or password")
        return;
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        message.sendErrorResponse(res,401,"invalid email or password")
        return;
      }
      const token = await generateToken(parsedBody);
      console.log(token);
      res.setHeader("Authorization", `${token}`);
      // res.writeHead(200, { "Content-Type": "application/json" });

      // res.end(
      //   JSON.stringify({
      //     message: "Login Successful",
      //     userData: parsedBody,
      //     token: token,
      //   })
      // );
      message.sendSuccessResponse(res, 'Logged in successfully', {user_data:parsedBody,token});
    } catch (error) {
      console.error("Error logging in user:", error);
      message.sendErrorResponse(res,500,"internal server error")
      return;
    }
  });
};
