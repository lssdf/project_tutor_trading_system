const pool = require("../config/db");

exports.getPlans = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM plans ORDER BY price");
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.processPayment = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { plan_id, payment_method } = req.body;
    const uid = req.user.id;

    const [[plan]] = await conn.query("SELECT * FROM plans WHERE id=?", [plan_id]);
    if (!plan) { await conn.rollback(); return res.status(404).json({ message: "Plan not found" }); }

    // Cancel existing active subs
    await conn.query("UPDATE subscriptions SET status='cancelled' WHERE user_id=? AND status='active'", [uid]);

    const start = new Date().toISOString().split("T")[0];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration_days);
    const end = endDate.toISOString().split("T")[0];

    const [subResult] = await conn.query(
      "INSERT INTO subscriptions (user_id, plan_id, start_date, end_date, status) VALUES (?,?,?,?,'active')",
      [uid, plan_id, start, end]
    );
    const subId = subResult.insertId;

    const txnId = "TXN" + Date.now();
    await conn.query(
      "INSERT INTO payments (user_id, subscription_id, amount, payment_date, status, payment_method, transaction_id) VALUES (?,?,?,CURDATE(),'success',?,?)",
      [uid, subId, plan.price, payment_method || "UPI", txnId]
    );

    // Auto-assign tutor for paid plans
    if (plan.name !== "basic") {
      const [tutors] = await conn.query(
        `SELECT tp.user_id, COALESCE(tp.max_learners,10) as max_learners,
          COUNT(lt.learner_id) as current_count
         FROM tutor_profile tp
         LEFT JOIN learner_tutor lt ON lt.tutor_id=tp.user_id AND lt.active=1
         GROUP BY tp.user_id
         HAVING current_count < COALESCE(tp.max_learners,10)
         ORDER BY current_count ASC
         LIMIT 1`
      );
      if (tutors.length > 0) {
        const tutorId = tutors[0].user_id;
        const [existing] = await conn.query(
          "SELECT id FROM learner_tutor WHERE learner_id=? AND tutor_id=?", [uid, tutorId]
        );
        if (existing.length === 0) {
          await conn.query("INSERT INTO learner_tutor (learner_id, tutor_id, active) VALUES (?,?,1)", [uid, tutorId]);
        } else {
          await conn.query("UPDATE learner_tutor SET active=1 WHERE learner_id=? AND tutor_id=?", [uid, tutorId]);
        }
      }
    }

    await conn.commit();
    res.json({ message: "Payment successful!", subscription_id: subId, transaction_id: txnId, plan: plan.name });
  } catch (err) {
    await conn.rollback();
    console.error("Payment error:", err.message);
    res.status(500).json({ message: err.message });
  } finally { conn.release(); }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE subscriptions SET status='cancelled' WHERE user_id=? AND status='active'", [req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "No active subscription" });
    await pool.query("UPDATE learner_tutor SET active=0 WHERE learner_id=?", [req.user.id]);
    res.json({ message: "Subscription cancelled successfully" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.history = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, pl.name as plan_name, pl.price, pl.description
       FROM subscriptions s JOIN plans pl ON pl.id=s.plan_id
       WHERE s.user_id=? ORDER BY s.created_at DESC`, [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
