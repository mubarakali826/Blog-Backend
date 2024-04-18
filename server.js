const http = require("http");
const handleAuthRoutes = require("./Routes/authRoutes");
const handleBlogRoutes = require("./Routes/blogRoutes");
const { connectToDatabase } = require("./utils/db");
require("dotenv").config();
const message = require("./helpers/message");

const PORT = process.env.PORT;

connectToDatabase().then(() => {
  const server = http.createServer((req, res) => {
    if (req.url.startsWith("/api/auth")) {
      handleAuthRoutes(req, res);
    } else if (req.url.startsWith("/api/blog")) {
      handleBlogRoutes(req, res);
    } else {
      message.sendErrorResponse(res, 400,"invalid endpoint");
      return;
    }
  });

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
