const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport");
const rateLimit = require("express-rate-limit");

dotenv.config();

const connectDB = require("./config/db");
const configurePassport = require("./config/passport");
const authRoutes = require("./routes/auth.routes");
const documentRoutes = require("./routes/document.routes");
const conversationRoutes = require("./routes/conversation.routes");
const healthRoutes = require("./routes/health.routes");
const billingRoutes = require("./routes/billing.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(passport.initialize());

configurePassport();

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "test" ? 10000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

app.use("/api", generalLimiter);

app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/billing", billingRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  start();
}

module.exports = app;
