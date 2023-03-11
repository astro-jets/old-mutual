const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    service:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Service"
    },
    created_on:{
        type:Date,
        required:true,
        default:Date.now
    }
})

const booking = mongoose.model('booking',bookingSchema);
module.exports = booking;