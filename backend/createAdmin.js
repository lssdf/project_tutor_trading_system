const bcrypt = require("bcryptjs");
const pool = require("./config/db");
require("dotenv").config();

async function createAdmin() {
  const name  = "Admin";
  const email = "admin@tutortrading.com";   // ← apna email yahan
  const password = "Admin@1234";            // ← apna password yahan

  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length) {
    console.log("Admin already exists!");
    process.exit();
  }

  const password_hash = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
    [name, email, password_hash]
  );
  console.log("✅ Admin created!");
  console.log("   Email   :", email);
  console.log("   Password:", password);
  process.exit();
}

createAdmin().catch(console.error);