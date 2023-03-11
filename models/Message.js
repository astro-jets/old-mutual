const mongoose = require('mongoose')

const months =[
      'jan','feb','mar','apr'
] 

const messageSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,'Please enter the title of your message.']
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    message:{
        type:String,
        required:[true,'Please enter your message.']
    },
    date:{
        type:Date,
        default:Date.now()
    }
})

const message = mongoose.model('Message',messageSchema);


messageSchema.virtual('betdate').get(function(){
if(this.date)
  {
    return(this.date.getDate()+' '+months[this.date.getMonth()]+' '+this.date.getFullYear())
  }
})

module.exports = message;