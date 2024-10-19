const prisma = require('../config/prisma')
const createError = require('../utility/create-error')

module.exports = async(collectionId)=>{
    // validate collectionId
    if(!collectionId)return createError(400,"Collection ID is require")
    if(isNaN(collectionId) || Math.trunc(collectionId) !== collectionId)return createError(400,"Collection ID must be integer")


    // check collectionId exist
    const collection = await prisma.collection.findUnique({
            where : {
                id : collectionId
            }
        })
    if(!collection)return createError(400,"Collection does not exist")
    return collection

}