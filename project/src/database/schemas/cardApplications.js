const mongoose = require("mongoose")

const cardApplicationSchema = new mongoose.Schema({
    userID:{
        type: String,
        required: true,
        unique: false,
    },
    cardInfos: {
        cardType:{
            type: String,
            required: true,
            unique: false,
        },
        cardName:{
            type: String,
            required: true,
            unique: false,
        },
        limit:{
            type: mongoose.Schema.Types.Decimal128,
            required: true,
            unique: false,
            default: 500
        }
    },
    isAccepted:{
        type: String,
        required: true,
        unique: false,
    },
    note:{
        type: String,
        required: false,
        unique: false
    },
    createdAd:{
        type: Date,
        required: true,
        unique: false,
        default: new Date()
    }
})

module.exports = mongoose.model("cardApplications", cardApplicationSchema)