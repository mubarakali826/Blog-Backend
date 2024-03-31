const { signup, login } = require('../controllers/authController');

function handleAuthRoutes(req, res) {
  const { method , url } = req;
  if (method === 'POST' && url.endsWith('/signup')) {
    signup(req, res );
  } else if (method === 'POST' && url.endsWith('/login')) {
    login(req, res );
  } else {
    // Handle 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
}

module.exports = handleAuthRoutes;
