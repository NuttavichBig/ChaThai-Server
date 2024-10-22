const prisma = require('../../config/prisma')
const findCollectionById = require('../../services/findCollectionById')
const createError = require('../../utility/create-error')
const gameService = require("../../services/game-service")

module.exports.leaveRoom = async (io,userId, roomId) => {
    try {
        console.log('User has leave a room')

        // check is exist if not return immediately
        const isExist = await gameService.checkUserInRoom(userId)
        if(!isExist)return

        // delete user from room
        const delUser = await prisma.inRoomPlayer.delete({
            where: {
                userId
            }
        })

        // check game room status
        const room = await gameService.checkGameRoomById(roomId)

        // if last user delete room
        const member = await gameService.findMember(roomId)
        if (member.length === 0 && room.status !== 'HOLDING') {
            console.log('no user left')
            const delRoom = await prisma.room.delete({
                where: {
                    id: roomId
                }
            })
            console.log(delRoom, "Delete this room completed")
        } else if(delUser.isMaster){
            const newMaster = await prisma.inRoomPlayer.update({
                where : {
                    userId : member[0].userId
                },data :{
                    isMaster : true,
                    playerRole : 'GUESS'
                },include :{
                    users: {
                        select : {
                            id : true,
                            username : true,
                            displayName : true,
                            profileImage : true
                        }
                    }
                }
            })
            member.splice(0,1,newMaster)
            // if not the last emit to other player
        }
        io.to(roomId).emit('memberUpdated',member)
    } catch (err) {
        console.log("Disconnected's Error", err.message)
    }

}

module.exports.changeCollection = async (io, socket, collectionId) => {
    try {
        console.log('change collection controller')
        // collection service
        await findCollectionById(collectionId)

        // user verify
        const userInRoom = await gameService.checkUserInRoom(socket.user.id)
        if (!userInRoom) return createError(400, "You're not in room")
        if (userInRoom.isMaster !== true) return createError(401, "You're not permitted ")

        // is Room in waiting
        if (userInRoom.rooms.status !== 'WAITING') return createError(400, "Can't update while room in this state")

        // update
        const room = await prisma.room.update({
            where: {
                id: userInRoom.roomId,
            },
            data: {
                collectionId: collectionId
            }
        });
        io.to(room.id).emit('roomUpdated', room)
        console.log('change collection completed')
    } catch (err) {
        console.log(err.message)
        socket.emit("error", err.message)
    }
}

module.exports.changeMaster = async (io, socket, newMasterId) => {
    try {
        // user verify
        const userInRoom = await gameService.checkUserInRoom(socket.user.id)
        if (!userInRoom) return createError(400, "You're not in room")
        if (userInRoom.isMaster !== true) return createError(401, "You're not permitted ")

        // is Room in waiting
        if (userInRoom.rooms.status !== 'WAITING') return createError(400, "Can't update while room in this state")

        // check new master data
        const newMaster = await gameService.checkUserInRoom(newMasterId)
        if (!newMaster) return createError(400, "User is not in room")

        // updated
        await prisma.inRoomPlayer.updateMany({
            where: {
                roomId: userInRoom.roomId,
                userId: { not: newMasterId }
            }, data: {
                isMaster: false,
                playerRole: 'HINT'
            }
        });
        await prisma.inRoomPlayer.update({
            where: {
                id: newMaster.id
            }, data: {
                isMaster: true,
                playerRole: 'GUESS'
            }
        })

        // get new member data
        const member = await gameService.findMember(userInRoom.roomId)

        // emit to everyone
        io.to(userInRoom.roomId).emit('memberUpdated',member)
    } catch (err) {
        console.log(err.message)
        socket.emit("error", err.message)
    }
}


module.exports.ready = async (io,socket) => {
    try {

        // user verify
        const userInRoom = await gameService.checkUserInRoom(socket.user.id)
        if (!userInRoom) return createError(400, "You're not in room")

        // is Room in waiting
        if (userInRoom.rooms.status !== 'WAITING') return createError(400, "Can't update while room in this state")

        // update ready
        await prisma.inRoomPlayer.update({
            where: {
                id: userInRoom.id
            }, data: {
                isReady: !userInRoom.isReady
            }
        })

        // send back member
        const member = await gameService.findMember(userInRoom.roomId)
        io.to(userInRoom.roomId).emit('memberUpdated',member)
    } catch (err) {
        console.log(err.message)
        socket.emit("error", err.message)
    }
}


