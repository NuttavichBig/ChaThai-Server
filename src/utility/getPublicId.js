module.exports = (url) =>{
    const pattern = /\/v\d+\/(.+)\.[a-z]+$/
    const match = url.match(pattern)
    return match[1]
}