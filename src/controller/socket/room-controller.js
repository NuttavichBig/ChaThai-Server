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
        if (!room) return createError(404, "Room not found")
        if (room.status === 'PLAYING' || room.status === 'HOLDING') return createError(409, "Game room is full or now playing")

        // find member of this room
        const member = await gameService.findMember(room.id)
        console.log(member)

        // check is Master
        let isMaster = false;
        if(member.length === 0)isMaster = true;


        // join
        await prisma.inRoomPlayer.create({
            data: {
                userId: socket.user.id,
                roomId: room.id,
                isMaster: isMaster
            }
        })
        // initial join room
        socket.join(room.id)


        // client emit
        socket.emit('joinComplete', { message: 'You has join successfully', room: room, member: member })

        // other client emit
        io.to(room.id).emit('userJoined', { message: `user ${socket.user.username} has join room ${room.id} code ${room.code}`, user: { id: socket.user.id, username: socket.user.username } })


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

