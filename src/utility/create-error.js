const createError = (code,msg)=>{
    const error = new Error(msg)
    error.statusCode = code
    throw error
}

module.exports = createError