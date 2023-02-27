const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminController')
const {requireAuth, currentUser} = require('../middleware/authMiddleware')

// All Routes
router.get("*",currentUser, requireAuth)

//Dashboard
router.get("/", controller.index)

//Hostels Page
router.get("/hostels", controller.hostels)

//Customers Page
router.get("/customers", controller.customers)

// Booking Pages
router.get("/bookings", controller.bookings)

//NEW Hostel *Get*
router.get("/newhostel",controller.newHostel)

//NEW Hostel *Post*
router.post("/newhostel", controller.saveHostel)

//Approve Booking*
router.get("/approvebooking/:id", controller.approveBooking)

//Decline Booking *Post*
router.get("/declinebooking/:id", controller.declineBooking)


module.exports = router;