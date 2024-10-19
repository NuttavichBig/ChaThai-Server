const prisma = require("../../config/prisma")
const gameService = require("../../services/game-service")

module.exports.leaveRoomController =  async(userId,roomId) => {
    try{

        console.log('User has leave a room')
        await prisma.inRoomPlayer.delete({
            where : {
                userId 
            }
        })
        const member = await gameService.findMember(roomId)
        if(!member){
            console.log('no user left')
            const delRoom = await prisma.room.delete({
                where : {
                    id : roomId
                }
            })
            console.log(delRoom,"Delete this room completed")
        }
    }catch(err){
        console.log('Disconnected Error',err.message)
    }

}