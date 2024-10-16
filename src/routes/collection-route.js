const express = require("express")
const router = express.Router()
const upload =require("../middlewares/upload")
const authenticate = require("../middlewares/authenticate")
const collectionController = require("../controller/collection-controller")
const {getCollectionValidator,createCollectionValidator,updateCollectionValidator} =require("../middlewares/validator")


router.get('/',getCollectionValidator,collectionController.getCollection) // have query
router.get('/:id',collectionController.getCollectionDetail)
router.post('/',authenticate,upload.single('coverImage'),createCollectionValidator,collectionController.createCollection)
router.patch('/:id',authenticate,upload.single('coverImage'),updateCollectionValidator,collectionController.updateCollection)
router.delete('/:id',authenticate,collectionController.deleteCollection)


module.exports = router
