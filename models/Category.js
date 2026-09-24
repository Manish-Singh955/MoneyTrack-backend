const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    icon: {
      type: String,
      default: "💰",
    },

    color: {
      type: String,
      default: "#6366f1",
    },

    type: {
      type: String,
      enum: ["expense", "income"],
      default: "expense",
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Category",
  categorySchema
);