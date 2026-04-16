const express = require("express");
const router = express.Router();
const lc = require("../controllers/learnerController");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");


router.use(authMiddleware, roleMiddleware("learner"));
router.get("/dashboard", lc.dashboard);
router.get("/portfolio", lc.portfolio);
router.get("/trades", lc.trades);
router.post("/trades", lc.addTrade);
router.get("/sessions", lc.sessions);
router.get("/reports", lc.reports);
router.get("/subscription", lc.subscription);
router.get("/my-tutor", lc.myTutor);
router.post("/rate-tutor", lc.rateTutor);
module.exports = router;
