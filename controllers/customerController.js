const imageMimeTypes = ['image/jpeg','image/png','image/ico']
const moment = require('moment');
const User = require('../models/User')  
const Service = require('../models/Service')  
const Book = require('../models/Booking')  
const Message = require('../models/Message')  
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
// Services
module.exports.services= async (req,res)=>{ 
    try{
        const services = await Service.find();
        res.render('services/index',{
            services:services
        })
    }catch(err){res.send(err)}
}
// Profile
module.exports.profile= async (req,res)=>{ 
    try{
        const user = res.locals.user
        const message = await Message.findOne({user:user._id})
            
        const data ={
            id:message._id,
            thread:[]
        } 
        for (let i = 0; i < message.thread.length; i++) {
            const t = message.thread[i];
            data.thread.push({
                response:t.message,
                from:t.from,
                date:moment(t.time).calendar(),
            })            
        }
        
        res.render('profile/index',{
            user: user,
            data:data,
            layout:'layouts/noheader'
        })
    }
    catch(err){res.send(err.message)}
}

// Book a service
module.exports.bookService= async (req,res)=>{ 
    const bookingDetails = {
        service:req.params.id,
        customer:res.locals.user._id
    }
    
    try{
        const user = await User.findById(res.locals.user._id)
        const service = await Service.findById(bookingDetails.service);
        bookingDetails.cost = service.cost;
        
        if(user){
            const booking = await Book.create(bookingDetails);
            user.subscriptions.push({service:service.name,cost:service.cost});
            await user.save()
        }
        res.redirect('/profile')
    }catch(err){
        res.send(err.message)
    }
}

// Send a contact message
module.exports.contacts = async (req,res)=>{
    try{
        const message = {
            user:res.locals.user._id,
            thread:{
                from:"user",
                message:req.body.message,
                status:"unread",
                timestamp:Date.now()
            }
        }
        const m = await Message.create(message)
        res.render('contacts/index')
    }catch(err){
        res.send(err.message)
    }
}
//Messages response
module.exports.messageReply = async (req,res)=>{
    try{
        const thread = {
            timestamp:Date.now(),
            message: req.body.response,
            from:'user',
            status:'unread'
        }
        const message = await Message.findById(req.params.id)
        message.thread.push(thread)
        await message.save()

        const data ={
            id:message._id,
            message:message.message,
            date: moment(message.date).calendar(),
            thread:[]
        }   
        for (let i = 0; i < message.thread.length; i++) {
            const t = message.thread[i];
            data.thread.push({
                response:t.message,
                from:t.from,
                date:moment(t.time).calendar(),
            })            
        }
        
        res.status(200).json({status:true,message:data});
    }
    catch(err){
        res.send(err.message)
    }
}

//Signup Route
module.exports.signUp = async (req,res)=>{
    
    const userDetails = {
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
        userType:'customer'
    }
    saveAvatar(userDetails,req.body.avatar)

    try{
        const user = await User.create(userDetails)
        const token = createToken(user._id);
        res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000})
        res.redirect('/services')
    }
    catch(err)
    {
        const errors = handleErrors(err)
        console.log(errors)
        res.status(201).json({errors})
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


function saveAvatar(userDetails, encodedAvatar)
{
    if(encodedAvatar == null){return}

    const avatar = JSON.parse(encodedAvatar)
    if(avatar != null && imageMimeTypes.includes(avatar.type))
    {
        userDetails.avatar = new Buffer.from(avatar.data, 'base64')
        userDetails.avatarType = avatar.type
    }
}