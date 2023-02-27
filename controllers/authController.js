const imageMimeTypes = ['image/jpeg','image/png','image/ico']
const User = require('../models/User')  
const jwt = require('jsonwebtoken') 

const maxAge = 3 * 24 * 60 * 60

// Create Token
const createToken = (id)=>{
    return jwt.sign({id},process.env.TOKEN_SECRET,{
        expiresIn: maxAge
    });
}

// Handle Errors
const handleErrors = (err)=>{
    let errors = {
        username:'',
        email:'',
        password:''
    }
    // Email error
    if(err.message === 'Incorrect Email')
    {
        errors.email = "That email is not registred."
    }
    
    // Password error
    if(err.message==='Incorrect Password'){
        errors.password = "The password incorrect."
    }
    
    // Validating errors
    if(err.code === 11000){
        errors.email = "That email is already registred."
        return(errors)
    }
    if(err.message.includes('user validation failed'))
    {
        Object.values(err.errors).forEach(properties=>{
            errors[properties.path] = properties.message
        })
    }

    return(errors)
    
}

//Index Page
module.exports.registrationIndex = (req,res)=>{
    try{        
        res.render('registration/index');
    }
    catch
    {
        res.render('/');
    }
}

//Signup Route
module.exports.signUp = async (req,res)=>{
    const{username,email,password} = req.body;
    try{
        const user = await User.create({username,email,password})
        const token = createToken(user._id);
        res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000})
        res.status(201).json({user})
    }
    catch(err)
    {
        const errors = handleErrors(err)
        res.status(201).json({errors})
    }
}

// LogOut Route
module.exports.logOut = async (req,res)=>{
    try{
        res.cookie('jwt','',{httpOnly:true,maxAge:1})
        res.redirect('/')
    }
    catch(err)
    {
        const errors = handleErrors(err)
        res.json({errors})
    }
}

// LogIn Route
module.exports.logIn = async (req,res)=>{
    const{email,password} = req.body;
    try{
        const user = await User.login(email,password)
        const token = createToken(user._id);
        res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000})
        res.status(200).json({user:user._id})
    }
    catch(err)
    {
        const errors = handleErrors(err)
        res.json({errors})
    }
}


function saveAvatar(agentDetails, encodedAvatar)
{
    if(encodedAvatar == null){return}

    const avatar = JSON.parse(encodedAvatar)
    if(avatar != null && imageMimeTypes.includes(avatar.type))
    {
        agentDetails.avatar = new Buffer.from(avatar.data, 'base64')
        agentDetails.avatarType = avatar.type
    }
}