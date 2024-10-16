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




// Web socket
io.on('connection',(socket)=>{
    //Connection check
    console.log('User has connected')
    console.log(socket)



    //Disconnection check
    socket.on('disconnect',()=>{
        console.log("User has disconnected")
    })
})




//Server Listen
const port = process.env.PORT || 8888
server.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})
