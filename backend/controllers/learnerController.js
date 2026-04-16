const pool = require("../config/db");

// GET /api/learner/dashboard
exports.dashboard = async (req, res) => {
  try {
    const uid = req.user.id;

    const [[profile]] = await pool.query(
      `SELECT u.name, u.email, lp.experience_level, lp.bio, lp.profile_pic_url
       FROM users u JOIN learner_profile lp ON lp.user_id = u.id WHERE u.id = ?`, [uid]
    );

    const [portfolio] = await pool.query(
      `SELECT p.*, a.symbol, a.name as asset_name, a.asset_type, a.current_price,
        (a.current_price - p.avg_price) * p.quantity AS pnl
       FROM portfolio p JOIN assets a ON a.id = p.asset_id WHERE p.user_id = ?`, [uid]
    );

    const [subscription] = await pool.query(
      `SELECT s.*, pl.name as plan_name, pl.price FROM subscriptions s
       JOIN plans pl ON pl.id = s.plan_id
       WHERE s.user_id = ? AND s.status = 'active' ORDER BY s.end_date DESC LIMIT 1`, [uid]
    );

    const [sessions] = await pool.query(
      `SELECT s.*, u.name as tutor_name FROM sessions s
       JOIN users u ON u.id = s.tutor_id WHERE s.learner_id = ?
       ORDER BY s.scheduled_at DESC LIMIT 5`, [uid]
    );

    const [recentTrades] = await pool.query(
      `SELECT t.*, a.symbol, a.name as asset_name FROM trades t
       JOIN assets a ON a.id = t.asset_id WHERE t.user_id = ?
       ORDER BY t.trade_date DESC LIMIT 10`, [uid]
    );

    const [reports] = await pool.query(
      `SELECT r.*, u.name as tutor_name FROM reports r
       JOIN users u ON u.id = r.tutor_id WHERE r.learner_id = ?
       ORDER BY r.created_at DESC`, [uid]
    );

    res.json({ profile, portfolio, subscription: subscription[0] || null, sessions, recentTrades, reports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/learner/portfolio
exports.portfolio = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, a.symbol, a.name as asset_name, a.asset_type, a.current_price,
        (a.current_price - p.avg_price) * p.quantity AS pnl,
        ((a.current_price - p.avg_price) / p.avg_price * 100) AS pnl_pct
       FROM portfolio p JOIN assets a ON a.id = p.asset_id WHERE p.user_id = ?`, [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/learner/trades
exports.trades = async (req, res) => {
  try {
    const { type, from, to } = req.query;
    let q = `SELECT t.*, a.symbol, a.name as asset_name, a.asset_type
             FROM trades t JOIN assets a ON a.id = t.asset_id WHERE t.user_id = ?`;
    const params = [req.user.id];
    if (type) { q += " AND t.trade_type = ?"; params.push(type); }
    if (from) { q += " AND t.trade_date >= ?"; params.push(from); }
    if (to) { q += " AND t.trade_date <= ?"; params.push(to); }
    q += " ORDER BY t.trade_date DESC";
    const [rows] = await pool.query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/learner/trades
exports.addTrade = async (req, res) => {
  try {
    const { asset_id, trade_type, quantity, price, trade_date, notes } = req.body;
    const uid = req.user.id;

    await pool.query(
      "INSERT INTO trades (user_id, asset_id, trade_type, quantity, price, trade_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [uid, asset_id, trade_type, quantity, price, trade_date, notes || null]
    );

    // Update portfolio
    const [existing] = await pool.query(
      "SELECT * FROM portfolio WHERE user_id = ? AND asset_id = ?", [uid, asset_id]
    );
    if (trade_type === "buy") {
      if (existing.length) {
        const totalQty = parseFloat(existing[0].quantity) + parseFloat(quantity);
        const newAvg = ((existing[0].avg_price * existing[0].quantity) + (price * quantity)) / totalQty;
        await pool.query("UPDATE portfolio SET quantity = ?, avg_price = ? WHERE user_id = ? AND asset_id = ?",
          [totalQty, newAvg, uid, asset_id]);
      } else {
        await pool.query("INSERT INTO portfolio (user_id, asset_id, quantity, avg_price) VALUES (?, ?, ?, ?)",
          [uid, asset_id, quantity, price]);
      }
    } else if (trade_type === "sell" && existing.length) {
      const newQty = parseFloat(existing[0].quantity) - parseFloat(quantity);
      if (newQty <= 0) {
        await pool.query("DELETE FROM portfolio WHERE user_id = ? AND asset_id = ?", [uid, asset_id]);
      } else {
        await pool.query("UPDATE portfolio SET quantity = ? WHERE user_id = ? AND asset_id = ?", [newQty, uid, asset_id]);
      }
    }

    res.status(201).json({ message: "Trade added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/learner/sessions
exports.sessions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, u.name as tutor_name, tp.specialization, tp.rating
       FROM sessions s JOIN users u ON u.id = s.tutor_id
       LEFT JOIN tutor_profile tp ON tp.user_id = s.tutor_id
       WHERE s.learner_id = ? ORDER BY s.scheduled_at DESC`, [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/learner/reports
exports.reports = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.name as tutor_name FROM reports r
       JOIN users u ON u.id = r.tutor_id WHERE r.learner_id = ?
       ORDER BY r.created_at DESC`, [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/learner/subscription
exports.subscription = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, pl.name as plan_name, pl.price, pl.description
       FROM subscriptions s JOIN plans pl ON pl.id = s.plan_id
       WHERE s.user_id = ? ORDER BY s.created_at DESC`, [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/learner/my-tutor
exports.myTutor = async (req, res) => {
  try {
    const uid = req.user.id;
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, tp.specialization, tp.years_exp, tp.rating, tp.bio,
        lt.assigned_at,
        (SELECT COUNT(*) FROM sessions WHERE tutor_id=u.id AND learner_id=? AND status='completed') as sessions_done,
        (SELECT COUNT(*) FROM sessions WHERE tutor_id=u.id AND learner_id=? AND status='scheduled') as sessions_upcoming
       FROM learner_tutor lt
       JOIN users u ON u.id = lt.tutor_id
       LEFT JOIN tutor_profile tp ON tp.user_id = lt.tutor_id
       WHERE lt.learner_id = ? AND lt.active = 1
       LIMIT 1`, [uid, uid, uid]
    );
    res.json(rows[0] || null);
  } catch (err) { res.status(500).json({ message: err.message }); }
};




// POST /api/learner/rate-tutor
exports.rateTutor = async (req, res) => {
  try {
    const learner_id = req.user.id;
    const { tutor_id, rating, review } = req.body;

    if (!tutor_id || !rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Valid tutor_id and rating (1-5) required" });

    // Check karo ki learner ka is tutor ke saath completed session hai
    const [sessions] = await pool.query(
      `SELECT id FROM sessions WHERE learner_id = ? AND tutor_id = ? AND status = 'completed' LIMIT 1`,
      [learner_id, tutor_id]
    );
    if (!sessions.length)
      return res.status(403).json({ message: "Aap sirf us tutor ko rate kar sakte hain jiske saath session complete hua ho" });

    // Rating save karo (ek table chahiye — neeche SQL diya hai)
    await pool.query(
      `INSERT INTO tutor_ratings (tutor_id, learner_id, rating, review)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), review = VALUES(review)`,
      [tutor_id, learner_id, rating, review || null]
    );

    // tutor_profile mein average rating update karo
    await pool.query(
      `UPDATE tutor_profile SET rating = (
         SELECT AVG(rating) FROM tutor_ratings WHERE tutor_id = ?
       ) WHERE user_id = ?`,
      [tutor_id, tutor_id]
    );

    res.json({ message: "Rating successfully di gayi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};