const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// Helper: JWT token generate karta hai
const generateToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, experience_level, specialization, years_exp, bio } = req.body;

    // Step 1: Required fields check
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "Required fields missing" });

    // Step 2: Admin role directly register nahi ho sakta
    if (role === "admin")
      return res.status(403).json({ message: "Admin account seedhi registration se nahi ban sakta" });

    // Step 3: Valid role check
    if (!["learner", "tutor"].includes(role))
      return res.status(400).json({ message: "Invalid role. Only 'learner' or 'tutor' allowed" });

    // Step 4: Email already exists check
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length)
      return res.status(409).json({ message: "Email already registered" });

    // Step 5: Password hash karo
    const password_hash = await bcrypt.hash(password, 10);

    // Step 6: User insert karo
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name, email, password_hash, role]
    );
    const userId = result.insertId;

    // Step 7: Role ke hisaab se profile banao
    if (role === "learner") {
      await pool.query(
        "INSERT INTO learner_profile (user_id, experience_level, bio) VALUES (?, ?, ?)",
        [userId, experience_level || "beginner", bio || null]
      );
    } else if (role === "tutor") {
      await pool.query(
        "INSERT INTO tutor_profile (user_id, specialization, years_exp, bio) VALUES (?, ?, ?, ?)",
        [userId, specialization || null, years_exp || 0, bio || null]
      );
    }

    const user = { id: userId, name, role };
    res.status(201).json({ token: generateToken(user), user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Step 1: Email & password required
    if (!email || !password)
      return res.status(400).json({ message: "Email aur password required hain" });

    // Step 2: User dhundo
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length)
      return res.status(401).json({ message: "Invalid credentials" });

    // Step 3: Password verify karo
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ message: "Invalid credentials" });

    // Step 4: Token return karo
    res.json({
      token: generateToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role,
        lp.experience_level, lp.bio AS learner_bio, lp.profile_pic_url,
        tp.specialization, tp.years_exp, tp.rating, tp.bio AS tutor_bio
       FROM users u
       LEFT JOIN learner_profile lp ON lp.user_id = u.id AND u.role = 'learner'
       LEFT JOIN tutor_profile tp ON tp.user_id = u.id AND u.role = 'tutor'
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "User not found" });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};