const mongoose = require("mongoose")

const creditsSchema = new mongoose.Schema({
      creditname:{
            type: String,
            required: true,
            unique: true,
      },
      creditdescription:{
            type: String,
            required: true,
            unique: false,
      },
      creditamount:{
            type: mongoose.Types.Decimal128,
            required: true,
            unique: false,
      },
      creditinterest:{
            type: mongoose.Types.Decimal128,
            required: true,
            unique: false,
      },
      creditexpirationmonth:{
            type: Number,
            required: true,
            unique: false,
      },
      creditinstallmentmonth:{
            type: Number,
            required: true,
            unique: false,
      },
      interestCalculated:{
            type: mongoose.Types.Decimal128,
            required: true,
            unique: false,
      },
      sumAmountToPay:{
            type: mongoose.Types.Decimal128,
            required: true,
            unique: false,
      },
      paymentInterval:{
            type: Number,
            required: true,
            unique: false,
      },
      paymentAmountPerInterval:{
            type: mongoose.Types.Decimal128,
            required: true,
            unique: false,
      },
      payCount:{
            type: Number,
            required: true,
            unique: false,
            default: 1
      },
      acceptDate:{
            type: Date,
            required: false,
            unique: false,
      },
      finishDate:{
            type: Date,
            required: false,
            unique: false,
      },
      paymentTime:{
            type: Date,
            required: false,
            unique: false,
      },
      creditActive:{
            type: Boolean,
            required: true,
            unique: false,
            default: true
      },
      createdAt:{
            type: Date,
            required: true,
            unique: false,
            default: new Date()
      }

})

module.exports = mongoose.model("credits", creditsSchema)