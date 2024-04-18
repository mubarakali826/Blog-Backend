// responseHandler.js

function sendSuccessResponse(res, message, data) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true, message, data }));
}

function sendErrorResponse(res, statusCode, message) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, error: message }));
}

function sendCustomResponse(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

module.exports = { sendSuccessResponse, sendErrorResponse, sendCustomResponse };
