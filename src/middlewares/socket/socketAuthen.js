const jwt = require('jsonwebtoken');
const createError = require('../../utility/create-error');
const prisma = require("../../config/prisma")


module.exports = async(socket,next)=>{
    try{
        console.log('Authenticate Socket')
        // get token from socket
        const  token = socket.handshake.headers.token
        // console.log(socket.handshake)
        if(!token) return createError(401,"Token required")


        // verify token
        const payLoad = jwt.verify(token,process.env.JWT_SR_KEY)


        // find user data 
        const findUser = await prisma.user.findUnique({ where: { id: payLoad.id } })
        if (!findUser) {
            return createError(401, "Token Invalid")
        }

        // put use data in socket
        socket.user = findUser
        next();
    }catch(err){
            // console.log(err)
            socket.emit('error' , err.message)
            next(err)
    }
}