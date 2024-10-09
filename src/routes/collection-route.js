const express = require("express")
const router = express.Router()
const upload =require("../middlewares/upload")
const authenticate = require("../middlewares/authenticate")
const collectionController = require("../controller/collection-controller")


router.get('/',collectionController.getCollection)
router.post('/',authenticate,upload.single('coverImage'),collectionController.createCollection)
router.patch('/:id',authenticate,upload.single('coverImage'),collectionController.updateCollection)
router.delete('/:id',authenticate,collectionController.deleteCollection)


module.exports = router
