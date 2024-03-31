const { createUser, findUserByEmail } = require("../models/User");
const bcrypt = require("bcrypt");
const {generateToken}=require("../token")

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
        res.status=400
        res.end(JSON.stringify({ message: "Invalid Entry" }));
        return;
      }
      const { username, email, password } = parsedBody;
      if (!username || !email || !password) {
        res.status = 400;
        res.end(JSON.stringify({ message: "Please fill the required fields" }));
        return;
      }
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        res.end(JSON.stringify("User already exists"));
        res.status = 400;
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await createUser({ username, email, password: hashedPassword });
      res.end(JSON.stringify("User created successfully"));
      res.status = 200;
    } catch (error) {
      console.error("Error signing up user:", error);
      res.end(JSON.stringify("Internal server error"));
      res.status = 500;
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
        res.status=400
        res.end(JSON.stringify({ message: "Invalid Entry" }));
        return;
      }
      const { email, password } = parsedBody;
      if (!email || !password) {
        res.status = 400;
        res.end(JSON.stringify({ message: "Please fill the required fields" }));
        return;
      }

      const user = await findUserByEmail(email);

      if (!user) {
        res.end(JSON.stringify("invalid email or password"));
        res.status = 401;
        return;
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        res.status = 401;
        res.end(JSON.stringify("invalid email or password"));
        return;
      }
      const token = await generateToken(parsedBody);
      
      res.setHeader('Authorization', `${token}`);
      res.end(JSON.stringify({message:"Login Successful"}));
      res.status = 200;
    } catch (error) {
      console.error("Error logging in user:", error);
      res.end(JSON.stringify("Internal server error"));
      res.status = 500;
    }
  });
};
