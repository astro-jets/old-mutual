const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema({
    
    name:{
        type:String,
        required:[true,'Please enter a name']
    },
    description:{
        type:String,
        required:[true,'Please enter service description']
    },
    cost:{
        type:String,
        required:true
    },
    thumbnail:{
        type:Buffer,
        required:true
    },
    thumbnailType:{
        type:String,
        required:true
    }
})

serviceSchema.virtual('thumbnailPath').get(function(){
  if(this.thumbnail != null && this.thumbnailType != null)
  {
    return `data:${this.thumbnailType};charset=utf-8;base64,${this.thumbnail.toString('base64')}`
  }
})

const service = mongoose.model('service',serviceSchema);
module.exports = service;