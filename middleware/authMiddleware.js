const jwt = require('jsonwebtoken')
const User = require('../models/User')

const requireAuth = (req,res,next)=>{
    const token = req.cookies.jwt;
    // Check if token exists and is valid
    if(token)
    {
        jwt.verify(token,process.env.TOKEN_SECRET,(err,decodedToken)=>{
            if(err){
                // console.log(err.message)
                res.redirect('auth/')
            }else{
                // console.log(decodedToken)
                next()
            }
        })

    }
    else{
        res.redirect('/auth')
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

module.exports = {requireAuth,currentUser}