const mongoose = require("mongoose")

const userBalanceSchema = new mongoose.Schema({
    userID:{
        type: String,
        required: true,
        unique: true,
    },
    balance:{
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        unique: false,
        default: 0.00,
    },
    iban:{
        type: String,
        required: true,
        unique: true,
    },
    debts: []
})

module.exports = mongoose.model("userBalance", userBalanceSchema)