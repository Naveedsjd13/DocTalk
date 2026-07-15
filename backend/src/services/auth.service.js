const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d";

const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
};

const generateToken = (userId) => {
  const jti = crypto.randomUUID();
  return jwt.sign({ id: userId, jti }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
};

module.exports = { hashPassword, comparePassword, generateToken };
