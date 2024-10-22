const jwt = require('jsonwebtoken');
const createError = require('../../utility/create-error');
const prisma = require("../../config/prisma")


module.exports = async(socket,next)=>{
    try{
        console.log('Authenticate Socket')
        // get token from socket
        const  authorization = socket.handshake.headers.authorization
        // console.log(socket.handshake)
        if (!authorization || !authorization.startsWith('Bearer')) {
            return createError(401, 'Unauthorized')
        }
        const token = authorization.split(' ')[1]
        if(!token)return createError(401,'Unauthorized')



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