const imageMimeTypes = ['image/jpeg','image/png','image/ico']
const Hostel = require('../models/Service')  
const Booking = require('../models/Booking')  
const User = require('../models/User')  
const file = ""
const fileType = ""

//Index Page
module.exports.index = async (req,res)=>{
    try{        
        // Get all hostels
        const allHostels = await Hostel.find();
        const allBookings = await Booking.find();
        const allUsers = await User.find();
        const bookingList=[]    
        for (let i = 0; i < allBookings.length; i++) {
            const current = allBookings[i]
            const hostel = await Hostel.findById(current.hostel);
            const user = await User.findById(current.user);
            bookingList.push({
                status:current.status,
                hostel:hostel.name,
                user:user,
                date:current.created_on
            });
                        
        }

        res.render('admin/index',{
            hostels:allHostels,
            bookings:bookingList,
            users:allUsers,
            layout:'layouts/adminLayout'
        });
    }
    catch
    {
        res.render('/');
    }
}

//Hostels
module.exports.hostels = async (req,res)=>{
    try{
        const hostels = await Hostel.find();
        res.render('admin/hostels',{
            hostels:hostels,
            layout:'layouts/adminLayout'
        });
    }
    catch(e){res.send(e.message)}
}


// New Hostel
module.exports.newHostel = async (req,res)=>{
    try{
        const hostels = await Hostel.find();
        res.render('admin/newhostel',{layout:'layouts/adminLayout'})
    }
    catch(e){res.send(e.message)}
}

// Save Hostel
module.exports.saveHostel = async (req,res)=>
{
    const hostelDetails = new Hostel({
        name:req.body.name,
        description: req.body.description
    })
    saveThumbnail(hostelDetails,req.body.thumbnail)
    try{
        const savedHostel = await hostelDetails.save()
        res.redirect('/admin/hostels')
    }
    catch(err)
    {
        // const errors = handleErrors(err)
        res.status(201).json({err})
    }
}

//Customers
module.exports.customers = async (req,res)=>{
    try{
        const users = await User.find();
        res.render('admin/customers',{
            users:users,
            layout:'layouts/adminLayout'
        });
    }
    catch(e){res.send(e.message)}
}

//Bookings
module.exports.bookings = async (req,res)=>{
    try{
        const bookings = await Booking.find();
        const bookingList=[]
        
        for (let i = 0; i < bookings.length; i++) {
            const current = bookings[i]
            const hostel = await Hostel.findById(current.hostel);
            const user = await User.findById(current.user);
            bookingList.push({
                id:current.id,
                status:current.status,
                hostel:hostel.name,
                user:user,
                date:current.created_on
            });
                        
        }
        res.render('admin/bookings',{
            bookings:bookingList,
            layout:'layouts/adminLayout'
        });
    }
    catch(e){res.send(e.message)}
}

// Approve Bookings
module.exports.approveBooking = async (req,res)=>{
    try{
        const booking = await Booking.findById(req.params.id);
        booking.status='approved';
        booking.save();
        res.redirect('/admin/bookings')
    }
    catch(e){res.send(e.message)}
}

//Decline Bookings
module.exports.declineBooking = async (req,res)=>{
    try{
        const booking = await Booking.findById(req.params.id);
        if(booking){
            booking.status='declined';
            booking.save();
        }
        res.redirect('/admin/bookings')
    }
    catch(e){res.send(e.message)}
}

function saveThumbnail(hostelDetails, encodedimg)
{
    if(encodedimg == null){return}

    const img = JSON.parse(encodedimg)
    if(img != null && imageMimeTypes.includes(img.type))
    {
        hostelDetails.thumbnail = new Buffer.from(img.data, 'base64')
        hostelDetails.thumbnailType = img.type
    }
}