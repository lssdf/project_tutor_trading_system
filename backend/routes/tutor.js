const express = require("express");
const router = express.Router();
const tc = require("../controllers/tutorController");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

router.use(authMiddleware, roleMiddleware("tutor"));
router.get("/dashboard", tc.dashboard);
router.get("/learners", tc.learners);
router.get("/learners/:id/portfolio", tc.learnerPortfolio);
router.get("/learners/:id/trades", tc.learnerTrades);
router.post("/sessions", tc.createSession);
router.patch("/sessions/:id/status", tc.updateSessionStatus);
router.post("/feedback", tc.addFeedback);
router.post("/reports", tc.createReport);
router.get("/capacity", tc.getCapacity);
router.patch("/capacity", tc.updateCapacity);

module.exports = router;
