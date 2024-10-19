module.exports = (userId)=>{
    const randomDigit = Math.floor(100+(Math.random()*900))
    const userDigit = userId.toString().slice(-3).padStart(3,'0')
    return randomDigit+userDigit
}