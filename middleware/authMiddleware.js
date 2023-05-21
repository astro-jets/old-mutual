const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Message = require('../models/Message')
const moment = require('moment')

const requireAuth = (req,res,next)=>{
    const token = req.cookies.jwt;
    // Check if token exists and is valid
    if(token)
    {
        jwt.verify(token,process.env.TOKEN_SECRET,(err,decodedToken)=>{
            if(err){
                // console.log(err.message)
                res.redirect('admin/login')
            }else{
                // console.log(decodedToken)
                next()
            }
        })

    }
    else{
        res.redirect('admin/login')
    }
}

const currentUser = (req,res,next)=>{
    const token = req.cookies.jwt;
    if(token){
        
        jwt.verify(token,process.env.TOKEN_SECRET,async (err,decodedToken)=>{
            if(err){
                console.log(err.message)
                res.locals.user = null;
                next()
            }else{
                let user = await User.findById(decodedToken.id)
                res.locals.user = user;
                next()
            }
        })
    }else{res.locals.user = null;next();}
}

const isAdmin = (req,res,next)=>{
    const token = req.cookies.jwt;
    // Check if token exists and is valid
    if(token)
    {
        jwt.verify(token,process.env.TOKEN_SECRET,async (err,decodedToken)=>{
            if(err){
                res.redirect('admin/login')
            }else{
                const user = res.locals.user
                if(user.userType === 'admin')
                {
                    res.locals.messages = await makeNotifictaions();
                    next()
                }
                else{
                    res.cookie('jwt','',{httpOnly:true,maxAge:1})
                    res.redirect('admin/login')
                }
            }
        })

    }
    else{
        res.redirect('admin/login')
    }
}

const isCustomer = (req,res,next)=>{
    const token = req.cookies.jwt;
    if(token){
        
        jwt.verify(token,process.env.TOKEN_SECRET,async (err,decodedToken)=>{
            if(err){
                res.locals.user = null;
                next()
            }else{
                let user = await User.findById(decodedToken.id)
                res.locals.user = user;
                if(user)
                {
                    if(user.userType === "admin")
                    {
                        res.render("404",{layout:"layouts/errors"})
                    }
                }
                else{res.cookie('jwt','',{httpOnly:true,maxAge:1})}
                next()
            }
        })
    }else{res.locals.user = null;next();}
}

async function makeNotifictaions(){
    const arr = []
    const messages = await Message.find()
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const lastMessage = message.thread[message.thread.length - 1];
        const user = await User.findById(message.user)
        if(lastMessage.status === "unread" && lastMessage.from === "user")
        {
            arr.push({
                id:message._id,
                msg:lastMessage.message,
                username:user.username,
                timestamp:moment(lastMessage.date).calendar()
            })
        }
    }
    return(arr);
}
module.exports = {requireAuth,currentUser,isAdmin,isCustomer}