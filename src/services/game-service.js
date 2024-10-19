const prisma = require("../config/prisma")

module.exports.checkGameRoomByCode = async(code)=>{
    console.log(code)
    const result = await prisma.room.findUnique({
        where :{
            code : code
        }
    })
    return result
}

module.exports.checkUserInRoom = async(userId)=>{
    const result = await prisma.inRoomPlayer.findUnique({
        where : {
            userId
        },include : {
            rooms : {
                select : {
                    status : true
                }
            }
        }
    })
    console.log(result)
    return result
 }


 module.exports.findMember = async(roomId)=>{
    const result = await prisma.inRoomPlayer.findMany({
        where : {
            roomId : roomId
        },include : {
            users : {
                select : {
                    id : true,
                    username : true,
                    displayName : true,
                    profileImage : true
                }
            }
        }
    })
    return result
 }

 module.exports.checkGameRoomById = async(roomId)=>{
    const result = await prisma.room.findUnique({
        where : {
            id : roomId
        }
    })
    return result
 }