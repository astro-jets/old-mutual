const express = require('express');
const router = express.Router();
const controller = require('../controllers/customerController')
const {isCustomer, currentUser} = require('../middleware/authMiddleware')

router.get("*",currentUser)
router.post("*",currentUser)

router.get('/',isCustomer,(req,res)=>{res.render('index')})

//faqs
router.get("/faqs",isCustomer,async (req,res)=>{res.render('faqs/index')})

//services
router.get("/services",isCustomer,controller.services)
router.get("/services/book/:id",isCustomer,controller.bookService)
router.get("/services/unsubscribe/:id",isCustomer,controller.unsubscribeService)


//About
router.get("/about",isCustomer,async (req,res)=>{res.render('about/index')})

//profile
router.get("/profile",isCustomer,controller.profile)

//Contacts
router.get("/contacts",isCustomer,async (req,res)=>{res.render('contacts/index')})

//Contacts
router.post("/contacts",isCustomer,controller.contacts)
router.post("/sendMessage",isCustomer,controller.sendMessage)

router.post("/contacts/response/:id",isCustomer,controller.messageReply)

//sign up customer
router.post("/signup",controller.signUp)

//log in customer
router.post("/login",controller.logIn)

//log Out
router.get("/logout",controller.logOut)

module.exports = router;