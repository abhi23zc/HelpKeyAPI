// Dummy API key list (should come from a database in productionject)
const validApiKeys = ["12345-abcde", "67890-fghij", "ggp-pro-ject"];

const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.header("x-api-key");

  if (!apiKey) {
    return res.status(403).json({ message: "API key is required" });
  }

  // Check if the provided API key is valid
  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({ message: "Invalid API key" });
  }

  // If the API key is valid, allow access
  next();
};

module.exports = apiKeyMiddleware;
