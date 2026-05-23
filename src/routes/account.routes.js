const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const accountController = require("../controller/account.controller")


const router = express.Router()

/**
 * -POST /api/accounts/
 * - create a new account
 * - private route 
 */
router.post("/" , authMiddleware.authMiddleware , accountController.createAccountController)
/**
 * -get /api/accounts/
 * - get all accounts of the user
 * - private route
 */
router.get("/" , authMiddleware.authMiddleware , accountController.getUserAccountsController)

/**
 * - GET /api/accounts/balance/:accountId
 */
router.get("/balance/:accountId" , authMiddleware.authMiddleware , accountController.getAccountBalanceController)

module.exports = router 