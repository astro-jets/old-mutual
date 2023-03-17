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

//Messages Single
router.get("/messages/:id",isAdmin, controller.messageSingle)

//Messages Reply
router.post("/messages/:id",isAdmin, controller.messageReply)

router.get("/geo",(req,res)=>{
async function getCurrentLocation() {
     const fetch = await import('node-fetch');
  const res = await fetch('https://ipapi.co/json/');
  const data = await res.json();
  const latitude = data.latitude;
  const longitude = data.longitude;
  return { latitude, longitude };
}

getCurrentLocation().then(coords => {
  console.log('Latitude:', coords.latitude);
  console.log('Longitude:', coords.longitude);
}).catch(err => {
  console.error('Error getting location:', err);
});

})

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