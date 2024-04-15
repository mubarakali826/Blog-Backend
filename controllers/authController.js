const { createUser, findUserByEmail } = require("../models/User");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/token");

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
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid Entry" }));
        return;
      }
      const { username, email, password } = parsedBody;
      if (!username || !email || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });

        res.end(JSON.stringify({ message: "Please fill the required fields" }));
        return;
      }
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        res.writeHead(400, { "Content-Type": "application/json" });

        res.end(JSON.stringify("User already exists"));
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const token = await generateToken(parsedBody);
      res.setHeader("Authorization", `${token}`);

      await createUser({ username, email, password: hashedPassword });
      res.writeHead(201, { "Content-Type": "application/json" });

      res.end(
        JSON.stringify({
          message: "User created successfully",
          userData: parsedBody,
          token: token,
        })
      );
    } catch (error) {
      console.error("Error signing up user:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify("Internal server error"));
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
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid Entry" }));
        return;
      }
      const { email, password } = parsedBody;
      if (!email || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });

        res.end(JSON.stringify({ message: "Please fill the required fields" }));
        return;
      }

      const user = await findUserByEmail(email);

      if (!user) {
        res.writeHead(401, { "Content-Type": "application/json" });

        res.end(JSON.stringify("invalid email or password"));

        return;
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        res.writeHead(401, { "Content-Type": "application/json" });

        res.end(JSON.stringify("invalid email or password"));
        return;
      }
      const token = await generateToken(parsedBody);
      console.log(token);
      res.setHeader("Authorization", `${token}`);
      res.writeHead(200, { "Content-Type": "application/json" });

      res.end(
        JSON.stringify({
          message: "Login Successful",
          userData: parsedBody,
          token: token,
        })
      );
    } catch (error) {
      console.error("Error logging in user:", error);
      res.writeHead(500, { "Content-Type": "application/json" });

      res.end(JSON.stringify("Internal server error"));
      return;
    }
  });
};
