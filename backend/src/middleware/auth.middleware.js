const jwt = require("jsonwebtoken");
const TokenBlocklist = require("../models/TokenBlocklist");

const auth = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const revoked = await TokenBlocklist.findOne({ jti: decoded.jti });
    if (revoked) {
      return res.status(401).json({ message: "Token has been revoked" });
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = auth;
