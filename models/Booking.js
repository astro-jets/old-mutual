const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
    hostel:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Hostel"
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    status:{
        type:String,
        default:'pending'
    },
    created_on:{
        type:Date,
        required:true,
        default:Date.now
    }
})

const booking = mongoose.model('booking',bookingSchema);
module.exports = booking;