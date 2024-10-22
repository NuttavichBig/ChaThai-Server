const prisma = require("../../config/prisma");
const gameService = require("../../services/game-service");
const createError = require("../../utility/create-error");
const gameController = require("./game-controller");
const subRoomController = require("./sub-room-controller")

module.exports = async (io, socket, arg) => {
    try {

        const { code } = arg
        const isInRoom = await gameService.checkUserInRoom(socket.user.id)
        if (isInRoom) return createError(400, "You already in room")

        // check room
        const room = await gameService.checkGameRoomByCode(code)
        if (!room) {
            // console.log('Room not found')
            // socket.emit("error", "Room not found")
            return createError(400,"Room not found")
        }

        if (room.status === 'PLAYING') return createError(409, "Game room is full or now playing")

        // find member of this room
        const member = await gameService.findMember(room.id)

        // check is First member
        let isMaster = false;
        let playerRole = 'HINT'
        if(member.length === 0){
            isMaster = true;
            playerRole = 'GUESS'
            const data = await prisma.room.update({
                where : {
                    id : room.id
                },data : {
                    status : 'WAITING'
                }
            })
            console.log('change room status to waiting',data)
        }


        // join
        const newMember = await prisma.inRoomPlayer.create({
            data: {
                userId: socket.user.id,
                roomId: room.id,
                isMaster,
                playerRole
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
        member.push(newMember)
        // initial join room
        socket.join(room.id)
        

        // client emit
        socket.emit('joinComplete', { message: 'You has join successfully', room: room, member: member })

        // other client emit
        io.to(room.id).emit('userJoined', { message: `user ${socket.user.username} has join room`, member})


        //listener remover
        // socket.off('changeCollection')
        // socket.off('changeMaster')
        // socket.off('ready')
        // socket.off('gameStart')
        socket.removeAllListeners('changeCollection')
        socket.removeAllListeners('changeMaster')
        socket.removeAllListeners('ready')
        socket.removeAllListeners('gameStart')

        // Change Category
        socket.on('changeCollection', ({ collectionId }) => subRoomController.changeCollection(io, socket, collectionId))

        // Change Master
        socket.on('changeMaster', ({ newMasterId }) => subRoomController.changeMaster(io, socket, newMasterId))

        // Ready
        socket.on('ready', () => subRoomController.ready(io, socket))

        // Game start
        socket.on('gameStart', () => gameController(io, socket))



        // Disconnected (Leave room)
        socket.on('disconnect', () => {
            
            subRoomController.leaveRoom(io, socket.user.id, room.id)
        })
    } catch (err) {
        console.log(err.message)
        socket.emit("error", err.message)
    }
};

