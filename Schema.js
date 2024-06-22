const mongoose = require('mongoose')

const trialSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    resetPasswordOTP:{
        type:String,
    },
    otpExpiry:{
        type:Date
    },
    isOTPVerified:{
        type: Boolean,
        default: false
    }
})

const Trial = mongoose.model('Trial',trialSchema)

module.exports = Trial;