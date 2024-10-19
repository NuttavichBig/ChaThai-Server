
const createError = require("../utility/create-error")
const gameCodeGenerate = require("../utility/gameCodeGenerate")
const gameService= require("../services/game-service")
const prisma = require("../config/prisma")
const findCollectionById = require("../services/findCollectionById")


module.exports.createGame = async(req,res,next)=>{
    try{
        // Destruction
        const {id} =req.user
        const {collectionId} = req.body
        
        // find collection service
        await findCollectionById(collectionId)


        // Check is user already in room?
        const checkInRoom = await gameService.checkUserInRoom(id)
        if(checkInRoom)return createError(400,"You already in room")

        // Game code generate
        let gameCode = ''
        let room = null
        do{ 
            gameCode = gameCodeGenerate(id)
            room = await gameService.checkGameRoomByCode(gameCode)
        }while(room)
        

        const newRoom = await prisma.room.create({
            data : {
                collectionId,
                code : gameCode
            }
        })
        res.json({message :"Game has created",room : newRoom})
    }catch(err){
        next(err);
    }
}

