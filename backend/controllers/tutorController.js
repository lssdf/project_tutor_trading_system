const pool = require("../config/db");

exports.dashboard = async (req, res) => {
  try {
    const uid = req.user.id;
    const [[profile]] = await pool.query(
      `SELECT u.name, u.email, tp.specialization, tp.years_exp, tp.rating, tp.bio, 
        COALESCE(tp.max_learners, 10) as max_learners
       FROM users u JOIN tutor_profile tp ON tp.user_id = u.id WHERE u.id = ?`, [uid]
    );
    const [learners] = await pool.query(
      `SELECT u.id, u.name, u.email, lp.experience_level,
        COUNT(t.id) as trade_count, lt.assigned_at
       FROM learner_tutor lt JOIN users u ON u.id = lt.learner_id
       JOIN learner_profile lp ON lp.user_id = u.id
       LEFT JOIN trades t ON t.user_id = u.id
       WHERE lt.tutor_id = ? AND lt.active = 1
       GROUP BY u.id`, [uid]
    );
    const [sessions] = await pool.query(
      `SELECT s.*, u.name as learner_name FROM sessions s
       JOIN users u ON u.id = s.learner_id WHERE s.tutor_id = ?
       ORDER BY s.scheduled_at DESC LIMIT 10`, [uid]
    );
    const [feedback] = await pool.query(
      `SELECT f.*, u.name as learner_name, s.topic FROM feedback f
       JOIN users u ON u.id = f.learner_id JOIN sessions s ON s.id = f.session_id
       WHERE f.tutor_id = ? ORDER BY f.created_at DESC LIMIT 5`, [uid]
    );
    const [[stats]] = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM learner_tutor WHERE tutor_id=? AND active=1) as total_learners,
        (SELECT COUNT(*) FROM sessions WHERE tutor_id=?) as total_sessions,
        (SELECT AVG(rating) FROM feedback WHERE tutor_id=?) as avg_rating`,
      [uid, uid, uid]
    );
    res.json({ profile, learners, sessions, feedback, stats });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.learners = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, lp.experience_level, lp.bio, lt.assigned_at, lt.active,
        COUNT(DISTINCT t.id) as trade_count,
        COALESCE(SUM(CASE WHEN t.trade_type='buy' THEN t.price*t.quantity ELSE 0 END),0) as total_invested,
        (SELECT AVG(f.rating) FROM feedback f WHERE f.learner_id=u.id AND f.tutor_id=?) as avg_rating,
        (SELECT COUNT(*) FROM sessions s WHERE s.learner_id=u.id AND s.tutor_id=? AND s.status='completed') as sessions_done,
        (SELECT status FROM subscriptions WHERE user_id=u.id AND status='active' LIMIT 1) as sub_status
       FROM learner_tutor lt
       JOIN users u ON u.id = lt.learner_id
       JOIN learner_profile lp ON lp.user_id = u.id
       LEFT JOIN trades t ON t.user_id = u.id
       WHERE lt.tutor_id = ?
       GROUP BY u.id`, [req.user.id, req.user.id, req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.learnerPortfolio = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, a.symbol, a.name as asset_name, a.asset_type, a.current_price,
        (a.current_price - p.avg_price) * p.quantity AS pnl,
        ((a.current_price - p.avg_price) / p.avg_price * 100) AS pnl_pct
       FROM portfolio p JOIN assets a ON a.id = p.asset_id WHERE p.user_id = ?`, [req.params.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.learnerTrades = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, a.symbol, a.name as asset_name, a.asset_type, a.current_price
       FROM trades t JOIN assets a ON a.id = t.asset_id
       WHERE t.user_id = ? ORDER BY t.trade_date DESC`, [req.params.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createSession = async (req, res) => {
  try {
    const { learner_id, topic, scheduled_at, duration_min, meeting_link } = req.body;
    await pool.query(
      "INSERT INTO sessions (tutor_id, learner_id, topic, scheduled_at, duration_min, meeting_link) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.id, learner_id, topic, scheduled_at, duration_min || 60, meeting_link || null]
    );
    res.status(201).json({ message: "Session scheduled" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query("UPDATE sessions SET status=? WHERE id=? AND tutor_id=?",
      [status, req.params.id, req.user.id]);
    res.json({ message: "Session updated" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addFeedback = async (req, res) => {
  try {
    const { session_id, learner_id, rating, strengths, improvements, notes } = req.body;
    await pool.query(
      "INSERT INTO feedback (session_id, tutor_id, learner_id, rating, strengths, improvements, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [session_id, req.user.id, learner_id, rating, strengths, improvements, notes]
    );
    await pool.query(
      "UPDATE tutor_profile SET rating=(SELECT AVG(rating) FROM feedback WHERE tutor_id=?) WHERE user_id=?",
      [req.user.id, req.user.id]
    );
    res.status(201).json({ message: "Feedback submitted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createReport = async (req, res) => {
  try {
    const { learner_id, title, period_start, period_end, summary } = req.body;
    const [[tradeData]] = await pool.query(
      `SELECT COUNT(*) as trade_count, COALESCE(SUM((a.current_price - t.price)*t.quantity),0) as total_pnl
       FROM trades t JOIN assets a ON a.id=t.asset_id
       WHERE t.user_id=? AND t.trade_date BETWEEN ? AND ?`,
      [learner_id, period_start, period_end]
    );
    await pool.query(
      "INSERT INTO reports (learner_id, tutor_id, title, period_start, period_end, summary, trade_count, total_pnl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [learner_id, req.user.id, title, period_start, period_end, summary, tradeData.trade_count, tradeData.total_pnl]
    );
    res.status(201).json({ message: "Report created" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getCapacity = async (req, res) => {
  try {
    const [[tp]] = await pool.query(
      "SELECT COALESCE(max_learners, 10) as max_learners FROM tutor_profile WHERE user_id=?", [req.user.id]
    );
    const [[count]] = await pool.query(
      "SELECT COUNT(*) as c FROM learner_tutor WHERE tutor_id=? AND active=1", [req.user.id]
    );
    res.json({ max_learners: tp?.max_learners || 10, current_count: count.c });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateCapacity = async (req, res) => {
  try {
    const { max_learners } = req.body;
    await pool.query("UPDATE tutor_profile SET max_learners=? WHERE user_id=?", [max_learners, req.user.id]);
    res.json({ message: "Capacity updated" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
