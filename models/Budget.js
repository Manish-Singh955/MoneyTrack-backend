const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    month: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

budgetSchema.index(
  {
    user_id: 1,
    category_id: 1,
    month: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model("Budget", budgetSchema);