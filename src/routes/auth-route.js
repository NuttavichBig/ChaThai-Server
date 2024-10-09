const express = require("express")
const router = express.Router()
const authController = require("../controller/auth-controller")
const {registerValidator,loginValidator,updateValidator} =require("../middlewares/validator")
const authenticate = require("../middlewares/authenticate")
const upload =require("../middlewares/upload")


router.post('/register',registerValidator,authController.register)
router.post('/login',loginValidator,authController.login)
router.patch('/update',authenticate,upload.single('profileImage'),updateValidator,authController.update)
router.get('/getRole',authenticate,authController.getRole)


module.exports = router