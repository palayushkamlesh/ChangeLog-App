const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const changelogRoutes = require("./routes/changelogRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

dotenv.config();
const authRoutes = require("./routes/authRoutes");
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/changelogs", changelogRoutes);
app.use("/api/v1/changelog", changelogRoutes);
app.use("/api/notifications", notificationRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Changelog API is running",
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });