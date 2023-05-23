
const imageMimeTypes = ['image/jpeg','image/png','image/ico']
const User = require('../models/User')  
const Service = require('../models/Service')  
const Book = require('../models/Booking')  
const Message = require('../models/Message')  
const moment = require('moment')
const jwt = require('jsonwebtoken')   
const fs = require('fs')
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
    try{
        data = await makeDashReport();
        res.render('admin/dashboard',{
            data:data,
            layout:'layouts/adminLayout'
        })
    }
    catch(err){}
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
        cost:req.body.cost,
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
            const lastThread = message.thread.length - 1
            all.push({
                id:message._id,
                name:user.username,
                avatar:user.avatarPath,
                title:message.thread[lastThread].message,
                date: moment(Date.now()).calendar()
            })
            if(message.thread[lastThread].status == 'unread' && message.thread[lastThread].from == 'user')
            {
                unread.push({
                id:message._id,
                name:user.username,
                avatar:user.avatarPath,
                title:message.thread[lastThread].message,
                date: moment(Date.now()).calendar()
            })
            }
        }

        res.render('admin/messages',{
            all:all,
            unread:unread,
            layout:'layouts/adminLayout'
        })
    }
    catch(err){
        console.log(err.message)
    }
}

//Messages response
module.exports.messageReply = async (req,res)=>{
    try{
        const thread = {
            time:Date.now(),
            message: req.body.response,
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
        const lastThread = message.thread[message.thread.length-1];
        lastThread.status='read'
        const update = await Message.updateOne(
            {_id:message._id},
            {$set:{thread:JSON.parse(JSON.stringify(message.thread))}}
        );
        const newMessage= await message.save();
        const user = await User.findById(message.user)
        const data ={
            id:req.params.id,
            avatar:user.avatarPath,
            name:user.username,
            email:user.email,
            title:message.title,
            message:message.message,
            date: moment(message.date).calendar(),
            thread:[]
        }
        for (let i = 0; i < message.thread.length; i++) {
            const t = message.thread[i];
            data.thread.push({
                response:t.message,
                from:t.from,
                date:moment(t.timestamp).calendar(),
            })            
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
    const notifications = await newSubscriptions()
    const all = await Book.find();
    const not = []
    for(let i=0; i < all.length; i++)
    {
        const a = all[i]
        const user = await User.findById(a.customer)
        const service = await Service.findById(a.service)
        not.push({
            username: user.username,
            service: service.name,
            timestamp: moment(a.created_on).calendar()
        })
        if(a.status === "unread")
        {
            a.status = "read";
            await Book.updateOne(
                {_id:a._id},
                {$set:{satus:'read'}}
            );
            await a.save();
        }
    };
    const nn = not.sort((a, b) => a.timestamp > b.timestamp ? 1 : -1)
    res.render('admin/notifications',{
        notifications:nn,
        layout:'layouts/adminLayout'
    })
}

//Update Notifications
module.exports.updateNotifications = async (req,res)=>{
    const arr = []
    let all = 0;
    const messages = await Message.find()
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const lastMessage = message.thread[message.thread.length - 1];
        const user = await User.findById(message.user)
        if(lastMessage.status === "unread" && lastMessage.from === "user")
        {
            if(arr.length < 3)
            {
                arr.push({
                    id:message._id,
                    msg:lastMessage.message,
                    username:user.username,
                    avatar:user.avatarPath,
                    timestamp:moment(lastMessage.date).calendar()
                })
            }
            all++;
        }
    }
    const a = await newSubscriptions()
    res.status(200).json({data:arr,unread:all,ns:a});
}

//Reports Page
module.exports.reports = async (req,res)=>{
    await makeReport();
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
                customers.push(
                    {
                        username:customer.username,
                        subscriptions:customer.subscriptions.map(s=> s.service),
                    })
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
        user:res.locals.user,
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
        res.redirect('/admin/')
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

async function newSubscriptions()
{
    const bookings = await Book.find()
    const arr = []
    for (let i = 0; i < bookings.length; i++) {
        const book = bookings[i];
        if(book.status === "unread")
        {
            let user = await User.findById(book.customer);
            let service = await Service.findById(book.service);
            let timeStamp = moment(book.created_on).calendar()
            if(user){
                arr.push({
                    username:user.username,
                    service:service.name,
                    timestamp:timeStamp
                })
            }
        }
    }
    return(arr)

}

async function makeReport(){
    const subscriptions = await Book.find();
    const users = await User.find()
    const areaChart = {
        yearlyFinances : [],
        yearlySubscriptions :[],
        yearlyRegistration :[]
    }
    const pieChart = {
        loans:0,
        funeral:0,
        savings:0,
        life:0
    }
    const barChart = {
        loans:0,
        funeral:0,
        savings:0,
        life:0
    }
    for(let i = 0 ; i < subscriptions.length; i ++)
    {
        const a = subscriptions[i];
        const service = await Service.findById(a.service);
        if(moment(a.created_on).month() === moment(Date.now()).month())
        {
            switch (service.name) {
                case 'Loans':
                    pieChart.loans++;
                    break;
                case 'Savings':
                    pieChart.savings++;
                    break;
                case 'Funeral Cover':
                    pieChart.funeral++;
                    break;
                case 'Life Cover':
                    pieChart.life++;
                    break;
            
                default:
                    break;
            }
        }
        switch (service.name) {
            case 'Loans':
                barChart.loans++;
                break;
            case 'Savings':
                barChart.savings++;
                break;
            case 'Funeral Cover':
                barChart.funeral++;
                break;
            case 'Life Cover':
                barChart.life++;
                break;
        
            default:
                break;
        }
    }
    for (let i = 0; i < 12; i++) {
        areaChart.yearlyFinances[i]= await getMonthlyFinances(subscriptions,i)
        areaChart.yearlySubscriptions[i]= await getMonthlySubscriptions(subscriptions,i)
        areaChart.yearlyRegistration[i]= await getMonthlyRegistration(users,i)
    }
    
    const charts = {
        pie: pieChart,
        bar:barChart,
        area:areaChart
    }      
    const data = JSON.stringify(charts)
    fs.writeFile('public/reports/lineChart.json',data, err=>{
        if(err)
        {
            console.log(err)
        }
        else{console.log('success saved report')}
    })

}


async function makeDashReport(){
    const subscriptions = await Book.find();
    const users = await User.find({userType:'customer'})
    const services = await Service.find();
    const currentMonthSubscriptions = subscriptions.filter(s=> moment(s.created_on).month() === moment(Date.now()).month()).length
    const currentMonthRegistrations = users.filter(s=> moment(s.created_on).month() === moment(Date.now()).month()).length
    const currentMonthFinances = await getMonthlyFinances(subscriptions,moment(Date.now()).month())

    return {
        customers:users,
        subscriptions:currentMonthSubscriptions,
        registrations:currentMonthRegistrations,
        finances:currentMonthFinances,
        services:services.length
    }

}

async function getMonthlyFinances(subscriptions,date){
    const arr = subscriptions.filter(s => moment(s.created_on).month() === date)
                .map(sub => parseInt(sub.cost));

    let total = 0;
    for (let i = 0; i < arr.length; i++) {
        const num = arr[i];
        total+=num;
    }
    return total/1000;
}

async function getMonthlySubscriptions(subscriptions,date){
    const total = subscriptions.filter(s => moment(s.created_on).month() === date).length;
    return total;

}

async function getMonthlyRegistration(users,date){
    const total = users.filter(s => moment(s.created_on).month() === date && s.userType === "customer").length;
    return total;

}