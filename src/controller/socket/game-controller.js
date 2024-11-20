const prisma = require("../../config/prisma")
const createError = require("../../utility/create-error")
const gameService = require("../../services/game-service")
const arrayShuffle = require("../../utility/arrayShuffle")
const timer = require("../../utility/timer")

module.exports = async (io, socket) => {
    try {
        console.log('game start')
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

        // clear listener
        socket.removeAllListeners('score')
        socket.removeAllListeners('endGame')

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

        console.log(words)
        // game start!!
        let totalScore = 0;
        let wordNumber = 0;

        // timer start (and return clear timer function to stopTimer)
        const stopTimer = timer(io, 90, room.id);



        // waiting for word changed event
        socket.on('score', (score) => {
            console.log('from',socket.id,'word No.',wordNumber)
            // console.log(score)
            totalScore = totalScore + score;
            if (wordNumber < words.length) {
                io.to(room.id).emit('getWord', words[wordNumber])
            } else {
                io.to(room.id).emit('getWord', 0)
            }
            // console.log(totalScore)
            wordNumber++;
        })

        // emit summary score
        socket.on('endGame', async () => {
            io.to(room.id).emit('summary', totalScore)
            console.log('summary emitted')
            stopTimer();
            const resetRoom = await prisma.room.update({
                where: {
                    id: room.id
                }, data: {
                    status: 'WAITING'
                }
            })
            await prisma.inRoomPlayer.updateMany({
                where: {
                    roomId: room.id
                }, data: {
                    isReady: false
                }
            })
            const updateAllMember = await gameService.findMember(room.id)
            io.to(room.id).emit('roomUpdated', resetRoom)
            io.to(room.id).emit('memberUpdated', updateAllMember)

        })


        console.log('end of game start controller')

        socket.on('disconnect', () => {
            
            stopTimer()
        })
    } catch (err) {
        console.log(err.message)
        socket.emit("error", err.message)
    }
}