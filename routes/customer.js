const express = require('express');
const router = express.Router();
const controller = require('../controllers/customerController')
const {requireAuth, currentUser} = require('../middleware/authMiddleware')

router.get("*",currentUser)
router.post("*",currentUser)

router.get('/',(req,res)=>{res.render('index')})

//faqs
router.get("/faqs",async (req,res)=>{res.render('faqs/index')})

//services
router.get("/services",controller.services)

router.get("/services/book/:id",controller.bookService)

//About
router.get("/about",async (req,res)=>{res.render('about/index')})

//profile
router.get("/profile",controller.profile)

//Contacts
router.get("/contacts",async (req,res)=>{res.render('contacts/index')})

//Contacts
router.post("/contacts",controller.contacts)

router.post("/contacts/response/:id",controller.messageReply)

//sign up customer
router.post("/signup",controller.signUp)

//log in customer
router.post("/login",controller.logIn)

//log Out
router.get("/logout",controller.logOut)

module.exports = router;