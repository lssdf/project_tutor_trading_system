const express = require("express");
const router = express.Router();
const sc = require("../controllers/subscriptionController");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

router.get("/plans", sc.getPlans);
router.post("/payment", authMiddleware, roleMiddleware("learner"), sc.processPayment);
router.post("/cancel", authMiddleware, roleMiddleware("learner"), sc.cancelSubscription);
router.get("/history", authMiddleware, sc.history);

module.exports = router;
