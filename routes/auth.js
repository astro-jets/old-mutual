const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController')

router.get("/", authController.registrationIndex)

//User sign up
router.post("/signUp", authController.signUp)

//User Log in
router.post("/logIn", authController.logIn)

//User Log Out
router.get("/logOut", authController.logOut)


module.exports = router;