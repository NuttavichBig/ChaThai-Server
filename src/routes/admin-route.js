const express = require("express")
const router = express.Router()
const adminController = require('../controller/admin-controller')
const {getUserValidator,updateUserValidator} =require("../middlewares/validator")
const upload =require("../middlewares/upload")



router.get('/',getUserValidator,adminController.getUser)
router.patch('/:id',upload.single('profileImage'),updateUserValidator,adminController.updateUser)
router.delete('/:id',adminController.deleteUser)



module.exports = router