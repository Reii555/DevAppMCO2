const express = require("express");
const router = express.Router();

const adminDashboardController = require("../controllers/adminDashboardController"); 

// render dashboard
router.get("/", async (req, res) => {
    console.log("SESSION USER:", req.session.user);
    try {
        if (!req.session.user) {
            return res.redirect("/login");
        }
        if (req.session.user.role !== "admin") {
            return res.redirect("/?error=Access Denied: Admin access only.");
        }
        adminDashboardController.renderDashboard(req, res);

    } catch (error) {
        console.error("Error loading admin-dashboard:", error);
        res.status(500).send(
            "Error loading dashboard: " + error.message
        );
    }
});

// revenue
router.get("/revenue", adminDashboardController.getRevenueData);

module.exports = router;