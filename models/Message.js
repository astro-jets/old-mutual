const mongoose = require('mongoose')
const messageSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    thread:[{
        type:Object
    }]
})

const message = mongoose.model('Message',messageSchema);
module.exports = message;