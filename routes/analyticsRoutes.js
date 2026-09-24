const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");

const protect = require("../middleware/authMiddleware");


// =====================================
// MONTHLY ANALYTICS
// =====================================

router.get("/monthly", protect, async (req, res) => {

  try {

    const month =
      req.query.month ||
      new Date().toISOString().slice(0, 7);

    const startDate =
      new Date(`${month}-01`);

    const endDate =
      new Date(startDate);

    endDate.setMonth(
      endDate.getMonth() + 1
    );


    const transactions =
      await Transaction.find({
        user_id: req.user.userId,

        occurred_at: {
          $gte: startDate,
          $lt: endDate
        }
      });


    let totalIncome = 0;
    let totalExpense = 0;


    transactions.forEach(
      (transaction) => {

        const amount =
          Number(transaction.amount);


        if (
          transaction.type === "income"
        ) {

          totalIncome += amount;

        }


        if (
          transaction.type === "expense"
        ) {

          totalExpense += amount;

        }

      }
    );


    const balance =
      totalIncome - totalExpense;


    res.json({

      month,

      totalIncome,

      totalExpense,

      balance,

      transactionCount:
        transactions.length

    });


  } catch (error) {

    res.status(500).json({

      message:
        "Failed to load monthly analytics",

      error:
        error.message

    });

  }

});
// =====================================
// CATEGORY-WISE EXPENSE
// =====================================

router.get(
  "/category-expenses",
  protect,
  async (req, res) => {

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

          type: "expense",

          occurred_at: {
            $gte: startDate,
            $lt: endDate
          }

        })
        .populate(
          "category_id",
          "name"
        );


      const categoryData = {};


      transactions.forEach(
        (transaction) => {

          const categoryName =
            transaction.category_id?.name ||
            "Other";


          if (
            !categoryData[categoryName]
          ) {

            categoryData[categoryName] =
              0;

          }


          categoryData[categoryName] +=
            Number(transaction.amount);

        }
      );


      const result =
        Object.keys(categoryData)
          .map((category) => ({

            category,

            amount:
              categoryData[category]

          }));


      res.json(result);


    } catch (error) {

      res.status(500).json({

        message:
          "Failed to load category expenses",

        error:
          error.message

      });

    }

  }
);


module.exports = router;