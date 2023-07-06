const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
    unique: false,
  },
  cardInfos: {
    cardType: {
      type: String,
      required: true,
      unique: false,
    },
    cardName: {
      type: String,
      required: true,
      unique: false,
    },
    cardNumber: {
      type: String,
      required: true,
      unique: true,
    },
    expirationDate: {
      type: String,
      required: true,
      unique: false,
    },
    cvv: {
      type: String,
      required: true,
      unique: false,
    },
    limit: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      unique: false,
      default: 500,
    },
  },
  createdAt: {
    type: Date,
    required: true,
    unique: false,
    default: Date.now,
  },
});

module.exports = mongoose.model("cards", cardSchema);
