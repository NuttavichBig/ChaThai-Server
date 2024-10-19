// Import Section
const express = require("express");
const cors = require("cors");
const socketIo = require("socket.io");
const {createServer}= require("node:http");
const handleError = require("./src/middlewares/error");
const adminCheck = require("./src/middlewares/adminCheck");
const authenticate =require("./src/middlewares/authenticate")

//Import Route
const authRoute = require("./src/routes/auth-route");
const collectionRoute = require("./src/routes/collection-route");
const gameRoute = require("./src/routes/game-route");
const adminRoute = require("./src/routes/admin-route");
const socketAuthen = require("./src/middlewares/socket/socketAuthen");
const roomController = require("./src/controller/socket/room-controller");


// Config Section
require("dotenv").config()
const app = express();
const server = createServer(app);
const io = socketIo(server,{
    cors : {}
})

// Entry Middleware
app.use(cors())
app.use(express.json())



// HTTP Request, Response
app.use('/auth',authRoute)
app.use('/collection',collectionRoute)
app.use('/game',authenticate,gameRoute)
app.use('/admin',authenticate,adminCheck,adminRoute)



// Error handler
app.use('*',handleError)
app.use(handleError)



// Socket middle ware
io.use(socketAuthen)

// Web socket
io.on('connection',(socket)=>{
    // Connection check
    console.log('User has connected')

    // Controller
    socket.on('joinRoom',(arg)=>roomController(io,socket,arg))
    // roomController(io,socket)


    // Disconnection check
    socket.on('disconnect',()=>{
        console.log("User has disconnected")
    })
})


// Global socket error handle
// io.on('error',err=>{
//     console.log('Global Socket.IO error :',err)
// })


//Server Listen
const port = process.env.PORT || 8888
server.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})
