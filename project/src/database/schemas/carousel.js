const mongoose = require("mongoose")

const caroselSchema = new mongoose.Schema({
      path:{
            type: String,
            required: true,
            unique: true
      },
      link:{
            type: String,
            required: false,
            unique: false
      },
      active:{
            type: Boolean,
            required: true,
            unique: false,
            default: true
      }
})

module.exports = mongoose.model("carousel", caroselSchema)