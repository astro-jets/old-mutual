const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminController')
const {requireAuth, currentUser,isAdmin} = require('../middleware/authMiddleware')


//Dashboard
router.get("/",isAdmin, controller.index)

//customers
router.get("/customers",isAdmin, controller.customers)

//Messages
router.get("/messages",isAdmin, controller.messages)

//Messages
router.get("/messages/:id",isAdmin, controller.single)

//customers
router.get("/notifications",isAdmin, controller.notifications)

//subscriptions
router.get("/subscriptions",isAdmin, controller.subscriptions)

//services
router.get("/services",isAdmin, controller.services)

//services
router.post("/services",controller.servicesPost)

//reports
router.get("/reports",isAdmin, controller.reports)

//profile
router.get("/profile",isAdmin, controller.profile)

//Admin Log in 
router.get("/login",controller.logInGet)

//Admin Log in 
router.post("/login",controller.logInPost)

//sign up admin
router.get("/signup",controller.signUpGet)

//sign up admin
router.post("/signup",controller.signUpPost)

//log out 
router.get("/logout",controller.logOut)

module.exports = router;