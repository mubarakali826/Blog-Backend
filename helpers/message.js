function sendSuccessResponse(res, message, data) {
  res.status(200).json({ success: true, message, data });
}

function sendErrorResponse(res, statusCode, message) {
  res.status(statusCode).json({ success: false, error: message });
}

function sendCustomResponse(res, statusCode, data) {
  res.status(statusCode).json(data);
}

module.exports = { sendSuccessResponse, sendErrorResponse, sendCustomResponse };
