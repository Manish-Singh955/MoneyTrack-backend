const express = require("express");

const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// All transaction routes require login

router.post(
  "/",
  protect,
  createTransaction
);


router.get(
  "/",
  protect,
  getTransactions
);


router.get(
  "/:id",
  protect,
  getTransaction
);


router.patch(
  "/:id",
  protect,
  updateTransaction
);


router.delete(
  "/:id",
  protect,
  deleteTransaction
);


module.exports = router;