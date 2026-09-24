const express = require("express");
const router = express.Router();

const Budget = require("../models/Budget");
const Category = require("../models/Category");
const Transaction = require("../models/Transaction");

const protect = require("../middleware/authMiddleware");

// =====================================
// ADD BUDGET
// =====================================

router.post("/", protect, async (req, res) => {
  try {
    const {
      category_id,
      amount,
      month
    } = req.body;

    if (!category_id || !amount || !month) {
      return res.status(400).json({
        message: "Category, amount and month are required"
      });
    }

    const category = await Category.findOne({
      _id: category_id,
      user_id: req.user.userId
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    const existingBudget = await Budget.findOne({
      user_id: req.user.userId,
      category_id,
      month
    });

    if (existingBudget) {
      return res.status(400).json({
        message: "Budget already exists for this category and month"
      });
    }

    const budget = await Budget.create({
      user_id: req.user.userId,
      category_id,
      amount,
      month
    });

    res.status(201).json({
      message: "Budget created successfully",
      budget
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create budget",
      error: error.message
    });
  }
});


// =====================================
// GET ALL BUDGETS
// =====================================

router.get("/", protect, async (req, res) => {
  try {
    const month =
      req.query.month ||
      new Date().toISOString().slice(0, 7);

    const budgets = await Budget.find({
      user_id: req.user.userId,
      month
    }).populate("category_id", "name icon color");

    res.json(budgets);

  } catch (error) {
    res.status(500).json({
      message: "Failed to get budgets",
      error: error.message
    });
  }
});


// =====================================
// GET BUDGET WITH CALCULATIONS
// =====================================

router.get("/calculations", protect, async (req, res) => {
  try {
    const month =
      req.query.month ||
      new Date().toISOString().slice(0, 7);

    const budgets = await Budget.find({
      user_id: req.user.userId,
      month
    }).populate("category_id", "name icon color");

    const startDate = new Date(`${month}-01`);

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const transactions = await Transaction.find({
      user_id: req.user.userId,

      type: "expense",

      occurred_at: {
        $gte: startDate,
        $lt: endDate
      }
    });

    const result = budgets.map((budget) => {

      const categoryExpenses = transactions.filter(
        (transaction) =>
          transaction.category_id &&
          transaction.category_id.toString() ===
          budget.category_id._id.toString()
      );

      const spent = categoryExpenses.reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );

      const remaining =
        Number(budget.amount) - spent;

      const percentage =
        budget.amount > 0
          ? (spent / budget.amount) * 100
          : 0;

      return {
        _id: budget._id,

        category: budget.category_id,

        budgetAmount: Number(budget.amount),

        spent: spent,

        remaining: remaining,

        percentage: Math.round(percentage),

        status:
          percentage >= 100
            ? "Exceeded"
            : percentage >= 80
            ? "Warning"
            : "Normal"
      };
    });

    res.json(result);

  } catch (error) {

    res.status(500).json({
      message: "Failed to calculate budgets",
      error: error.message
    });

  }
});


// =====================================
// DELETE BUDGET
// =====================================

router.delete("/:id", protect, async (req, res) => {
  try {

    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.userId
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found"
      });
    }

    res.json({
      message: "Budget deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to delete budget",
      error: error.message
    });

  }
});


module.exports = router;