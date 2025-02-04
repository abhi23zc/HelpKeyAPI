// routes/cors.js
function cors(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins or specify your frontend domain
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(204).end(); // No content for preflight
  }

  next(); // Move to the next middleware or route handler
}

module.exports = cors; // Export the function using CommonJS syntax
