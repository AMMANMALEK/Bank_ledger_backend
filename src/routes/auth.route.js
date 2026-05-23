const express = require("express")
const authController = require("../controller/auth.controller")


const router = express.Router()


router.post("/register" ,authController.userRegisterController)

/**
 *  POST - /api/auth/login */
 router.post("/login",authController.userloginController)

 
/**
 *  POST - /api/auth/logout
 */
router.post("/logout",authController.userLogoutController)




module.exports = router