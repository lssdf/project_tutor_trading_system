const express = require("express");
const router = express.Router();
const ac = require("../controllers/adminController");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

router.use(authMiddleware, roleMiddleware("admin"));
router.get("/stats", ac.stats);
router.get("/users", ac.users);
router.delete("/users/:id", ac.deleteUser);
router.get("/payments", ac.payments);
router.get("/plans", ac.plans);
router.put("/plans/:id", ac.updatePlan);
router.get("/assets", ac.assets);
router.post("/assets", ac.addAsset);
router.patch("/assets/:id/price", ac.updatePrice);

module.exports = router;
