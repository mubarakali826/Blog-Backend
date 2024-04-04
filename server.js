const http = require('http');
const handleAuthRoutes = require('./Routes/authRoutes');
const handleBlogRoutes = require('./Routes/blogRoutes');
const { connectToDatabase } = require('./utils/db');
require('dotenv').config();

const PORT = process.env.PORT ;

connectToDatabase().then(() => {
  const server = http.createServer((req, res) => {
    if (req.url.startsWith('/api/auth')) {
      handleAuthRoutes(req, res); 
    } else if (req.url.startsWith('/api/blog')) {
      handleBlogRoutes(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  });
  // Listen on the specified port
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});