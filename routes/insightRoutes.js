const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");

const protect =
  require("../middleware/authMiddleware");


// =====================================
// GET INSIGHTS
// =====================================

router.get("/", protect, async (req, res) => {

  try {

    const month =
      req.query.month ||
      new Date()
        .toISOString()
        .slice(0, 7);


    const startDate =
      new Date(`${month}-01`);


    const endDate =
      new Date(startDate);

    endDate.setMonth(
      endDate.getMonth() + 1
    );


    const transactions =
      await Transaction.find({

        user_id:
          req.user.userId,

        occurred_at: {
          $gte: startDate,
          $lt: endDate
        }

      })
      .populate(
        "category_id",
        "name"
      );


    let income = 0;
    let expense = 0;


    const categoryTotals = {};


    transactions.forEach(
      (transaction) => {

        const amount =
          Number(transaction.amount);


        if (
          transaction.type === "income"
        ) {

          income += amount;

        }


        if (
          transaction.type === "expense"
        ) {

          expense += amount;


          const category =
            transaction.category_id?.name ||
            "Other";


          if (
            !categoryTotals[category]
          ) {

            categoryTotals[category] =
              0;

          }


          categoryTotals[category] +=
            amount;

        }

      }
    );


    const insights = [];


    // -----------------------------
    // EXPENSE > INCOME
    // -----------------------------

    if (expense > income) {

      insights.push(
        "Your expenses are higher than your income this month."
      );

    }


    // -----------------------------
    // HIGH EXPENSE
    // -----------------------------

    if (
      income > 0 &&
      expense > income * 0.8
    ) {

      insights.push(
        "You have used more than 80% of your income."
      );

    }


    // -----------------------------
    // SAVING
    // -----------------------------

    if (
      income > 0 &&
      expense < income * 0.5
    ) {

      insights.push(
        "Your expenses are below 50% of your income."
      );

    }


    // -----------------------------
    // HIGHEST CATEGORY
    // -----------------------------

    let highestCategory = null;
    let highestAmount = 0;


    Object.keys(categoryTotals)
      .forEach((category) => {

        if (
          categoryTotals[category] >
          highestAmount
        ) {

          highestAmount =
            categoryTotals[category];

          highestCategory =
            category;

        }

      });


    if (highestCategory) {

      insights.push(
        `Your highest expense category is ${highestCategory} with ₹${highestAmount}.`
      );

    }


    // -----------------------------
    // NO TRANSACTIONS
    // -----------------------------

    if (
      transactions.length === 0
    ) {

      insights.push(
        "No transactions found for this month."
      );

    }


    res.json({

      month,

      income,

      expense,

      insights

    });


  } catch (error) {

    res.status(500).json({

      message:
        "Failed to generate insights",

      error:
        error.message

    });

  }

});


module.exports = router;