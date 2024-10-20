const prisma = require("../../config/prisma")
const createError = require("../../utility/create-error")
const gameService = require("../../services/game-service")
const arrayShuffle = require("../../utility/arrayShuffle")
const timer = require("../../utility/timer")

module.exports = async (io, socket) => {
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
            where: {
                id: userInRoom.roomId
            }, data: {
                status: 'PLAYING'
            }
        })

        // emit to everyone
        io.to(room.id).emit('roomUpdated', room)

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

        // shuffle
        const words = arrayShuffle(collection.words)


        // game start!!
        let totalScore = 0;
        let wordNumber = 0;

        // timer start
        timer(io, socket, room.id)


        // waiting for word changed event
        socket.on('score',(score)=>{
            totalScore =+ score;
            io.to(room.id).emit('getWord',words[wordNumber])
            wordNumber++;
        })
        
        // emit summary score
        socket.on('endGame',()=>{
            prisma.room.update({
                where : {
                    id : room.id
                },data : {
                    status : 'WAITING'
                }
            })
            io.to(room.id).emit('summary',totalScore)
            socket.on('rejoin',async()=>{
                await prisma.inRoomPlayer.delete({
                    where : {
                        userId : socket.user.id
                    }
                })
                socket.off('joinRoom')
            })
        })




        console.log('end of game start controller')



    } catch (err) {
        console.log(err.message)
        socket.emit("error", err.message)
    }
}