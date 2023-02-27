const express = require('express');
const Booking = require('../models/Booking');
const Hostel = require('../models/Service');
const router = express.Router();

const {requireAuth, currentUser} = require('../middleware/authMiddleware')
// All Routes
router.get("*",currentUser )
router.get("/",async (req,res)=>{    
    try{
        res.render('index');
    }
    catch(err)
    {
        res.send(err);
    }
})


//Users Bookings Hostel
router.get("/faqs",async (req,res)=>{    
    res.render('faqs/index')
})

//Users Bookings Hostel
router.get("/about",async (req,res)=>{    
    res.render('about/index')
})

//Users Bookings Hostel
router.get("/profile",async (req,res)=>{    
    res.render('profile/index')
})

//Users Bookings Hostel
router.get("/contacts",async (req,res)=>{    
    res.render('contacts/index')
})
module.exports = router;