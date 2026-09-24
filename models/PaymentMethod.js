const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "cash",
        "bank",
        "card",
        "upi",
        "other",
      ],
      default: "cash",
    },

    last4: {
      type: String,
      default: "",
    },

    provider_label: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PaymentMethod",
  paymentMethodSchema
);