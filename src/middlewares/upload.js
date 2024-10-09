const path = require('path')
const multer = require("multer")

const storage = multer.diskStorage({
    destination : (req,file,callBack) => callBack(null, path.join(__dirname,'../upload-pic')) ,
    filename : (req,file,callBack) => {
        const {id} = req.user
        const fullFilename = `${id}_${Date.now()}_${Math.round(Math.random()*1000)}${path.extname(file.originalname)}`
        callBack(null, fullFilename)
    }
})

module.exports = multer({storage : storage})