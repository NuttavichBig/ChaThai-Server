module.exports = (io,socket,roomId)=>{
    let timeLeft = 90;
    
    const timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            io.to(roomId).emit('timesUp');
            return;
        }
        
        timeLeft--;
        io.to(roomId).emit('timerUpdate', timeLeft); 
    }, 1000); 
}