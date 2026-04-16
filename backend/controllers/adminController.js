const pool = require("../config/db");

// GET /api/admin/stats
exports.stats = async (req, res) => {
  try {
    const [[users]] = await pool.query("SELECT COUNT(*) as total, SUM(role='learner') as learners, SUM(role='tutor') as tutors FROM users");
    const [[revenue]] = await pool.query("SELECT SUM(amount) as total FROM payments WHERE status='success'");
    const [[sessions]] = await pool.query("SELECT COUNT(*) as total, SUM(status='completed') as completed, SUM(status='scheduled') as scheduled FROM sessions");
    const [[activeSubs]] = await pool.query("SELECT COUNT(*) as total FROM subscriptions WHERE status='active'");
    res.json({ users, revenue: revenue.total || 0, sessions, activeSubs: activeSubs.total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/users
exports.users = async (req, res) => {
  try {
    const { role } = req.query;
    let q = "SELECT id, name, email, role, created_at FROM users";
    const params = [];
    if (role) { q += " WHERE role = ?"; params.push(role); }
    q += " ORDER BY created_at DESC";
    const [rows] = await pool.query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/payments
exports.payments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.name as user_name, u.email,
        t.name as tutor_name, pl.name as plan_name
       FROM payments p JOIN users u ON u.id = p.user_id
       LEFT JOIN users t ON t.id = p.tutor_id
       LEFT JOIN subscriptions s ON s.id = p.subscription_id
       LEFT JOIN plans pl ON pl.id = s.plan_id
       ORDER BY p.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/plans
exports.plans = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM plans");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/plans/:id
exports.updatePlan = async (req, res) => {
  try {
    const { price, description, duration_days } = req.body;
    await pool.query("UPDATE plans SET price = ?, description = ?, duration_days = ? WHERE id = ?",
      [price, description, duration_days, req.params.id]);
    res.json({ message: "Plan updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/assets
exports.assets = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM assets ORDER BY asset_type, symbol");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/assets
exports.addAsset = async (req, res) => {
  try {
    const { symbol, name, asset_type, current_price } = req.body;
    await pool.query("INSERT INTO assets (symbol, name, asset_type, current_price) VALUES (?, ?, ?, ?)",
      [symbol, name, asset_type, current_price]);
    res.status(201).json({ message: "Asset added" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/assets/:id/price
exports.updatePrice = async (req, res) => {
  try {
    await pool.query("UPDATE assets SET current_price = ? WHERE id = ?", [req.body.price, req.params.id]);
    res.json({ message: "Price updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
