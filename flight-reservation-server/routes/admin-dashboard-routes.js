const express = require("express");

const router = express.Router();

const adminDashboardController =
    require("../controllers/adminDashboardController");


// render dashboard
router.get(
    "/",
    adminDashboardController.renderDashboard
);


// revenue
router.get(
    "/revenue",
    adminDashboardController.getRevenueData
);


module.exports = router;