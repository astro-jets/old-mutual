const express = require('express');
const router = express.Router();
const controller = require('../controllers/servicesController')
const {requireAuth, currentUser} = require('../middleware/authMiddleware')
// All Routes

//ALL Hostels
router.get("/", controller.index)

module.exports = router;