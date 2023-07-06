const mongoose = require("mongoose")

const adminProcessHistorySchema = new mongoose.Schema({
    processType:{
        type: String,
        required: true,
        unique: false,
    },
    user:{
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
        authorization:{
            type: String,
            required: true,
            unique: false
        }
    },
    admin:{
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
        authorization:{
            type: String,
            required: true,
            unique: false
        }
    },
    process:{
        type: String,
        required: true,
        unique: false,
    },
    updatedInformations:{
        type: Object,
        required: false,
        unique: false,
    },
    processDate:{
        type: Date,
        required: true,
        unique: false,
        default: new Date()
    }
})

module.exports = mongoose.model("adminProcessHistory", adminProcessHistorySchema)