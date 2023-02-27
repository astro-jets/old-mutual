const mongoose = require('mongoose')
const {isEmail} = require('validator')
const bcrypty = require('bcrypt')

const userSchema = new mongoose.Schema({
    
    username:{
        type:String,
        required:[true,'Please ebter a username']
    },
    email:{
        type:String,
        required:[true,'Please enter an email'],
        unique:true,
        lowercase:true,
        validate:[isEmail,'Please enter a valid email']
    },
    password:{
        type:String,
        required:[true,'Please enter a password'],
        minlegnth:[8,'Password must not be less than 8 characters']
    }
})


userSchema.pre('save',async function(next){
    const salt = await bcrypty.genSalt();
    this.password = await bcrypty.hash(this.password,salt)
    next();
})

userSchema.statics.login = async function(email,password){
    const user = await this.findOne({email})
    if(user)
    {
        const auth = await bcrypty.compare(password,user.password)
        if(auth){
            return(user)
        }
        throw Error('Incorrect Password')
    }
    throw Error('Incorrect Email')
}

const User = mongoose.model('user',userSchema);
module.exports = User;