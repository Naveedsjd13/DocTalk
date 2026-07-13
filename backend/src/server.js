require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const documentRoutes = require("./routes/document.routes");
const conversationRoutes = require("./routes/conversation.routes");

const app = express();

app.use(express.json());

connectDB();

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/conversations", conversationRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT}`);
});
