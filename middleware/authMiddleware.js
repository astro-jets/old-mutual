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
        jwt.verify(token,process.env.TOKEN_SECRET,(err,decodedToken)=>{
            if(err){
                res.redirect('admin/login')
            }else{
                const user = res.locals.user

                if(user.userType === 'admin'){next()}
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

module.exports = {requireAuth,currentUser,isAdmin}