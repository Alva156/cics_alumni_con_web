const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // User info from the token
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // Token has expired, redirect to login
      return res
        .status(401)
        .json({ msg: "Token has expired, please log in again" });
    }
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = authenticateJWT;
