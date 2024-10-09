const jwt = require("jsonwebtoken");
const createError = require("../utility/create-error")
const prisma = require("../config/prisma")


module.exports = async (req, res, next) => {
    try {
        console.log('authenticate')
        // get authorization from request
        const authorization = req.headers.authorization

        // validate authorization
        if (!authorization || !authorization.startsWith('Bearer')) {
            return createError(401, 'Unauthorized')
        }

        // get token
        const token = authorization.split(' ')[1];
        if (!token) {
            return createError(401, "Unauthorized")
        }


        // verify
        const payload = jwt.verify(token, process.env.JWT_SR_KEY)


        // check user
        const findUser = await prisma.user.findUnique({ where: { id: payload.id } })
        if (!findUser) {
            return createError(401, "Unauthorized")
        }
        if(findUser.status === 'BANNED' || findUser.status === 'INACTIVE')return createError(4001,"Unauthorized")



        // delete password
        const { password, ...userData } = findUser
        req.user = userData
        next();
    } catch (err) {
        next(err)
    }
}