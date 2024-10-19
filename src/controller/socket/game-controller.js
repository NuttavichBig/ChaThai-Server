const prisma = require("../../config/prisma")
const createError = require("../../utility/create-error")
const gameService = require("../../services/game-service")
const arrayShuffle = require("../../utility/arrayShuffle")
const timer = require("../../utility/timer")

module.exports = async (io,socket) => {
    try {
        // user verify
        const userInRoom = await gameService.checkUserInRoom(socket.user.id)
        if (!userInRoom) return createError(400, "You're not in room")
        if (userInRoom.isMaster !== true) return createError(401, "You're not permitted ")

        // is Room in waiting
        if (userInRoom.rooms.status !== 'WAITING') return createError(400, "Room is not waiting state")

        // is everyone ready?
        const member = await gameService.findMember(userInRoom.roomId)
        const notReadyMember = member.find(item => item.isReady !== true)
        if (notReadyMember) return createError(400, "Someone in room not ready")
        
        // update status
        const room = await prisma.room.update({
            where:{
                id : userInRoom.roomId
            },data : {
                status : 'PLAYING'
            }
        })

        // get Collection
        const collection = await prisma.collection.findUnique({
            where: {
                id: room.collectionId
            },
            include: {
                words: {
                    select: {
                        word: true
                    }
                },
            }
        })
        const words = arrayShuffle(collection.words)
        // emit to everyone
        io.to(room.id).emit('roomUpdated',{room,words})
        
        timer(io,socket,room.id)


        console.log('end of game start controller')
    


    } catch (err) {
        console.log(err.message)
        socket.emit("error", err.message)
    }
}