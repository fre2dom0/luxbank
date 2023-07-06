const mongoose = require("mongoose")

const moneyHistorySchema = new mongoose.Schema({
      sender:{
            id:{
                  type: String,
                  required: true,
                  unique: false
            },
            name:{
                  type: String,
                  required: true,
                  unique: false
            },
            surname:{
                  type: String,
                  required: true,
                  unique: false
            },
            oldmoney:{
                  type: mongoose.Types.Decimal128,
                  required: true,
                  unique: false
            },
            amount:{
                  type: mongoose.Types.Decimal128,
                  required: true,
                  unique: false
            },
            newmoney:{
                  type: mongoose.Types.Decimal128,
                  required: true,
                  unique: false
            },
            note:{
                  type: String,
                  required: false,
                  unique: false
            }
      },
      receiver:{
            id:{
                  type: String,
                  required: true,
                  unique: false
            },
            name:{
                  type: String,
                  required: true,
                  unique: false
            },
            surname:{
                  type: String,
                  required: true,
                  unique: false
            },
            oldmoney:{
                  type: mongoose.Types.Decimal128,
                  required: true,
                  unique: false
            },
            newmoney:{
                  type: mongoose.Types.Decimal128,
                  required: true,
                  unique: false
            }
      },
      createdAt:{
            type: Date,
            required: true,
            unique: false,
            default: new Date()

      }
})

module.exports = mongoose.model("moneyprocesshistory", moneyHistorySchema)