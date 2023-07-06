const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        unique: false,
    },
    surname: {
        type: String, 
        required: true,
        unique: false,
    },
    email:{
        type: String, 
        required: true,
        unique: true,
    },
    password:{
        type: String, 
        required: true,
        unique: false,
    },
    tel:{
        type: String,
        required: true,
        unique: true
    },
    birthDate:{
        type: Date,
        required: true,
        unique: false
    },
    age:{
        type: Number,
        required: false,
        unique: false   
    },
    gender:{
        type: String,
        required: true,
        unique: false
    },
    identityNumber:{
        type: String,
        required: true,
        unique: true,   
    },
    address:{
        street:{
            type: String,
            required: true,
            unique: false,
        },
        district:{
            type: String,
            required: true,
            unique: false,
        },
        city:{
            type: String,
            required: true,
            unique: false,
        },
        country:{
            type: String,
            required: true,
            unique: false,
        },
    },
    authorization:{
        type: String,
        required: true,
        unique: false,
        default: "user"
    },
    pfpPath:{
        type: String,
        required: false,
        unique: false,
    },
    createdAt:{
        type: Date,
        required: true,
        unique: false,
        default: new Date()
    }
})

module.exports = mongoose.model('Users', userSchema);