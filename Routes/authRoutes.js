const { signup, login } = require('../controllers/authController');
const message = require("../helpers/message");

function handleAuthRoutes(req, res) {
  const { method , url } = req;
  if (method === 'POST' && url.endsWith('/signup')) {
    signup(req, res );
  } else if (method === 'POST' && url.endsWith('/login')) {
    login(req, res );
  } else {
    message.sendErrorResponse(res, 400, "Invalid Endpoint");
    return;
  }
}

module.exports = handleAuthRoutes;
