const express = require("express")
const router = express.Router()
const gameController = require('../controller/game-controller')
const authenticate = require("../middlewares/authenticate")


router.post('/',gameController.createGame)




module.exports = router