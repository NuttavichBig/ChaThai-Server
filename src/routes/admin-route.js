const express = require("express")
const router = express.Router()
const adminController = require('../controller/admin-controller')


router.get('/',adminController.getUser)
router.patch('/:id',adminController.updateUser)
router.delete('/:id',adminController.updateUser)



module.exports = router