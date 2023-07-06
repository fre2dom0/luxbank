const mongoose = require("mongoose")

const creditApplicationsSchema = new mongoose.Schema({
      creditID:{
            type: String,
            required: true,
            unique: false,
      },
      userID:{
            type: String,
            required: true,
            unique: false,
      },
      isAccepted:{
            type: String,
            required: true,
            unique:false,
            default: "waiting"
      },
      note:{
            type: String,
            unique: false,
            required: false
      },
      createdAt:{
            type: Date,
            required: true,
            unique: false,
            default: new Date()
      }
})

module.exports = mongoose.model("creditApplications", creditApplicationsSchema)