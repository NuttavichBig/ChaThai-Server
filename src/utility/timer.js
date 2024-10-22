module.exports = (io,timeLeft,roomId)=>{

    
    const timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            io.to(roomId).emit('timesUp');
            return;
        }
        
        timeLeft--;
        console.log(timeLeft)
        io.to(roomId).emit('timerUpdate', timeLeft); 
    }, 1000); 

    return ()=>{
        clearInterval(timerInterval);
        console.log('timer stop')
    };
}