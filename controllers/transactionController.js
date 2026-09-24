const Transaction = require("../models/Transaction");
const Category = require("../models/Category");
const PaymentMethod = require("../models/PaymentMethod");
const Notification = require("../models/Notification");


// CREATE TRANSACTION
const createTransaction = async (req, res) => {
  try {

    const {
      type,
      amount,
      category_id,
      merchant,
      note,
      occurred_at,
      payment_method_id,
    } = req.body;


    // Validation
    const numericAmount = Number(amount);

    if (!type || amount === undefined || amount === "" || !occurred_at) {
      return res.status(400).json({
        message:
          "Type, amount and date are required",
      });
    }


    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Amount must be a valid number greater than 0",
      });
    }


    // Check category belongs to user
    if (category_id) {

      const category = await Category.findOne({
        _id: category_id,

        $or: [
          { user_id: req.user._id },
          { user_id: null },
        ],
      });

      if (!category) {
        return res.status(400).json({
          message: "Invalid category",
        });
      }
    }


    // Check payment method belongs to user
    if (payment_method_id) {

      const paymentMethod =
        await PaymentMethod.findOne({
          _id: payment_method_id,
          user_id: req.user._id,
        });

      if (!paymentMethod) {
        return res.status(400).json({
          message: "Invalid payment method",
        });
      }
    }


    const transaction =
      await Transaction.create({
        user_id: req.user._id,
        type,
        amount: numericAmount,
        category_id: category_id || null,
        merchant,
        note,
        occurred_at,
        payment_method_id:
          payment_method_id || null,
      });


    const populatedTransaction =
      await Transaction.findById(
        transaction._id
      )
        .populate("category_id")
        .populate("payment_method_id");

    await Notification.create({
      user_id: req.user._id,
      title: "Transaction added",
      message: `${type === "income" ? "Income" : "Expense"} of ${numericAmount.toFixed(2)} was added${populatedTransaction.category_id?.name ? ` in ${populatedTransaction.category_id.name}` : ""}.`,
      type: type === "expense" ? "expense" : "system",
    });


    res.status(201).json({
      message: "Transaction created successfully",
      transaction: populatedTransaction,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// GET ALL TRANSACTIONS
const getTransactions = async (req, res) => {
  try {

    const transactions =
      await Transaction.find({
        user_id: req.user._id,
      })
        .populate("category_id")
        .populate("payment_method_id")
        .sort({
          occurred_at: -1,
        });


    res.json({
      transactions,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};
// GET SINGLE TRANSACTION
const getTransaction = async (req, res) => {
  try {

    const transaction =
      await Transaction.findOne({
        _id: req.params.id,
        user_id: req.user._id,
      })
        .populate("category_id")
        .populate("payment_method_id");


    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }


    res.json({
      transaction,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// UPDATE TRANSACTION
const updateTransaction = async (req, res) => {
  try {

    const transaction =
      await Transaction.findOne({
        _id: req.params.id,
        user_id: req.user._id,
      });


    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }


    const {
      type,
      amount,
      category_id,
      merchant,
      note,
      occurred_at,
      payment_method_id,
    } = req.body;


    if (amount !== undefined) {

      if (Number(amount) <= 0) {
        return res.status(400).json({
          message:
            "Amount must be greater than 0",
        });
      }

      transaction.amount = Number(amount);
    }


    if (type !== undefined) {
      transaction.type = type;
    }

    if (category_id !== undefined) {
      transaction.category_id = category_id;
    }

    if (merchant !== undefined) {
      transaction.merchant = merchant;
    }

    if (note !== undefined) {
      transaction.note = note;
    }

    if (occurred_at !== undefined) {
      transaction.occurred_at = occurred_at;
    }

    if (payment_method_id !== undefined) {
      transaction.payment_method_id =
        payment_method_id;
    }


    await transaction.save();


    const updated =
      await Transaction.findById(
        transaction._id
      )
        .populate("category_id")
        .populate("payment_method_id");


    res.json({
      message: "Transaction updated successfully",
      transaction: updated,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// DELETE TRANSACTION
const deleteTransaction = async (req, res) => {
  try {

    const transaction =
      await Transaction.findOne({
        _id: req.params.id,
        user_id: req.user._id,
      });


    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }


    await transaction.deleteOne();


    res.json({
      message:
        "Transaction deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
};