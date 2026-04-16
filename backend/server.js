require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    const color = res.statusCode >= 500 ? "\x1b[31m" : res.statusCode >= 400 ? "\x1b[33m" : "\x1b[32m";
    console.log(`${color}[${res.statusCode}]\x1b[0m ${req.method} ${req.path} — ${ms}ms`);
  });
  next();
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/learner", require("./routes/learner"));
app.use("/api/tutor", require("./routes/tutor"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/assets", require("./routes/assets"));
app.use("/api/plans", require("./routes/plans"));
app.use("/api/subscriptions", require("./routes/subscriptions"));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Error handler — logs full error to terminal
app.use((err, req, res, next) => {
  console.error("\x1b[31m[ERROR]\x1b[0m", req.method, req.path);
  console.error(err.message);
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
