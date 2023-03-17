
const imageMimeTypes = ['image/jpeg','image/png','image/ico']
const User = require('../models/User')  
const Service = require('../models/Service')  
const Book = require('../models/Booking')  
const Message = require('../models/Message')  
const moment = require('moment')
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
module.exports.index = async (req,res)=>{
    res.render('admin/dashboard',{
        layout:'layouts/adminLayout'
    })
}

//Services Page
module.exports.services = async (req,res)=>{
    try{
        const services = await Service.find()
        res.render('admin/services',{
            services:services,
            layout:'layouts/adminLayout'
        })
    }catch(err){
        const error = handleErrors(err)
    }
}

//Services Page
module.exports.servicesPost = async (req,res)=>{
    const serviceDetails = {
        name:req.body.name,
        description:req.body.description,
    }
    saveThumbnail(serviceDetails,req.body.avatar)
    try{
        const service = await Service.create(serviceDetails)
        res.redirect('/admin/services')
    }catch(err){
        const error = handleErrors(err)
        res.send(err.message)
    }
}

//Customers Page
module.exports.customers = async (req,res)=>{
    try{
        const customers = await User.find({userType:'customer'})
        res.render('admin/customers',{
            customers:customers,
            layout:'layouts/adminLayout'
        })
    }
    catch(err){
        const errors = handleErrors(err)
    }
}

//Messages Page
module.exports.messages = async (req,res)=>{
    try{
        const messages = await Message.find();
        const unread = []
        const all = []
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const user = await User.findById(message.user)
            all.push({
                id:message._id,
                name:user.username,
                avatar:user.avatarPath,
                title:message.title,
                date: moment(message.date).calendar()
            })
            if(message.status == 'unread'){
                unread.push({
                id:message._id,
                name:user.username,
                avatar:user.avatarPath,
                title:message.title,
                date: moment(message.date).calendar()
            })
            }
        }

        res.render('admin/messages',{
            all:all,
            unread:unread,
            layout:'layouts/adminLayout'
        })
    }
    catch(err){}
}

//Messages response
module.exports.messageReply = async (req,res)=>{
    try{
        const thread = {
            time:Date.now(),
            response: req.body.response,
            from:'admin',
            status:'unread'
        }
        const message = await Message.findById(req.params.id)
        message.thread.push(thread)
        await message.save()
        res.redirect(`/admin/messages/${req.params.id}`)
    }
    catch(err){res.send(err.message)}
}

//Messages single Page
module.exports.messageSingle = async (req,res)=>{
    try{
        const message = await Message.findById(req.params.id)
        message.status = 'read'
        await message.save()
        const user = await User.findById(message.user)
        const thread = []        
        for (let i = 0; i < message.thread.length; i++) {
            const t = message.thread[i];
            thread.push({
                response:t.response,
                from:t.from,
                date:moment(t.time).calendar(),
            })            
        }
        const data ={
            id:req.params.id,
            avatar:user.avatarPath,
            name:user.username,
            email:user.email,
            title:message.title,
            message:message.message,
            date: moment(message.date).calendar(),
            thread:thread
        }
        res.render('admin/messagesSingle',{
            data:data,
            layout:'layouts/adminLayout'
        })
    }
    catch(err){res.send(err.message)}
}

//Notifications Page
module.exports.notifications = async (req,res)=>{
    res.render('admin/notifications',{
        layout:'layouts/adminLayout'
    })
}

//Reports Page
module.exports.reports = async (req,res)=>{
    res.render('admin/reports',{
        layout:'layouts/adminLayout'
    })
}

//Subscriptions Page
module.exports.subscriptions = async (req,res)=>{
    try{
        const customers = []
        let prev_id = 0
        const bookings = await Book.find();
        for (let i = 0; i < bookings.length; i++) {
            const book = bookings[i];
            const customer = await User.findById(book.customer)
            
            if(prev_id+'' === customer._id+'')
            {
                continue;
            }
            else{
                prev_id = customer._id;
                customers.push(customer)
            }
        }
        res.render('admin/subscriptions',{
            customers:customers,
            layout:'layouts/adminLayout'
        })
    }
    catch(err){
        const errors= handleErrors(err)
        res.send(err.message)
    }
}

//Profile Page
module.exports.profile = async (req,res)=>{
    res.render('admin/profile',{
        layout:'layouts/adminLayout'
    })
}

//Index Page
module.exports.signUpGet = (req,res)=>{
    try{        
        res.render('authentication/register',{
            layout:'layouts/auth',
            errors:[]
        })
    }
    catch
    {
        res.render('/');
    }
}

//Signup Route
module.exports.signUpPost = async (req,res)=>{
    const userDetails = {
        username:req.body.username,
        email:req.body.email,
        phone:req.body.phone,
        password:req.body.password,
        userType:'admin'
    }
    saveAvatar(userDetails,req.body.avatar)
    try{
        const user = await User.create(userDetails)
        const token = createToken(user._id);
        res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000})
        res.render('admin/dashboard',{
            layout:'layouts/adminLayout'
        })
    }
    catch(err)
    {
        const errors = handleErrors(err)
        res.render('authentication/register',{
            errors:errors,
            layout:'layouts/auth'
        })
    }
}

// LogIn Page
module.exports.logInGet = async (req,res)=>{
    res.render('authentication/index',{layout:'layouts/auth'}
)}

// LogIn Post
module.exports.logInPost = async (req,res)=>{
    const{email,password} = req.body;
    try{
        const user = await User.login(email,password)
        const token = createToken(user._id);
        res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000})
        res.redirect('/admin')
    }
    catch(err)
    {
        const errors = handleErrors(err)
        res.json({errors})
    }
}

// LogOut
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

function saveThumbnail(serviceDetails, encodedAvatar)
{
    if(encodedAvatar == null){return}

    const avatar = JSON.parse(encodedAvatar)
    if(avatar != null && imageMimeTypes.includes(avatar.type))
    {
        serviceDetails.thumbnail = new Buffer.from(avatar.data, 'base64')
        serviceDetails.thumbnailType = avatar.type
    }
}