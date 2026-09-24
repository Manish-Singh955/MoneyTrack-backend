const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");
const protect = require("../middleware/authMiddleware");


// =====================================
// DASHBOARD SUMMARY
// =====================================

router.get("/summary", protect, async (req, res) => {

  try {

    const userId = req.user.userId;

    const transactions = await Transaction.find({
      user_id: userId
    })
      .populate("category_id", "name icon color")
      .sort({
        occurred_at: -1
      });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};

    transactions.forEach((transaction) => {

      const amount = Number(transaction.amount);

      if (transaction.type === "income") {
        totalIncome += amount;
      }

      if (transaction.type === "expense") {
        totalExpense += amount;

        const categoryName = transaction.category_id?.name || "Other";
        categoryTotals[categoryName] =
          (categoryTotals[categoryName] || 0) + amount;
      }

    });

    const balance =
      totalIncome - totalExpense;

    const recentTransactions =
      transactions.slice(0, 5);

    const topCategory = Object.entries(categoryTotals)
      .sort(([, firstAmount], [, secondAmount]) => secondAmount - firstAmount)[0]?.[0] || "No data";

    res.json({

      totalIncome,

      totalExpense,

      balance,

      transactionCount:
        transactions.length,

      topCategory,

      recentTransactions

    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to load dashboard",
      error: error.message
    });

  }

});


module.exports = router;