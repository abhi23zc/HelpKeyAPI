const jwt = require("jsonwebtoken");

const getUserInformation = (token) => {
  const secretKey = "yourSecretKey";
  if (!token) {
    return res.status(401).json({ message: "User is not authenticated" });
  }

  token = token.slice(6, token.length);

  // Check if the provided API key is valid
  jwt.verify(token, secretKey, (err, decoded) => {
    // if (err) {
    //   console.error("Token verification failed:", err);
    //   return;
    // } else {
    return decoded;
    //}
    // Now you can access the payload from the decoded object
  });
};
