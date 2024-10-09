const prisma = require("../src/config/prisma")
const bcrypt = require("bcryptjs")

const hashedPassword = bcrypt.hashSync('123456',10)


const userData = [
    {
        username : "admin",password : hashedPassword, email : "admin@mail.com", displayName : "JohnDoe", role : "ADMIN", profileImage : "https://www.svgrepo.com/show/500470/avatar.svg"        
    },
    {
        username : "john",password : hashedPassword, email : "john@mail.com", displayName : "JohnDoe", role : "ADMIN", profileImage : "https://www.svgrepo.com/show/509009/avatar-thinking-3.svg"
    },
    {
        username : "david",password : hashedPassword, email : "david@mail.com", displayName : "DavidJim", role : "USER"
    },
    {
        username : "jane",password : hashedPassword, email : "jane@mail.com", displayName : "JaneFoster", role : "USER", profileImage : "https://www.svgrepo.com/show/427079/avatar.svg"
    },
    {
        username : "guest5",password : "guest5",email : "5@guestmail.com", role : "GUEST"
    },
    {
        username : "guest6",password : "guest6",email : "6@guestmail.com", role : "GUEST"
    },
    {
        username : "guest7",password : "guest7",email : "7@guestmail.com", role : "GUEST"
    }
]


const collectionData1 = 
    {
        title : "React" , description : "Collection of react's relate word" , coverImage : "https://pbs.twimg.com/profile_images/1785867863191932928/EpOqfO6d_400x400.png", authorId : 1, 
        words : {
            create : [
                { word : "Component"},
                { word : "useState"},
                { word : "useEffect"},
                { word : "Facebook"},
                { word : "Hook"},
                { word : "useContext"},
                { word : "Fragment"},
                { word : "JSX"},
                { word : "Router"},
                { word : "Vite"}
            ]
        }
    }
    
    
const collectionData2 =
    {
        title : "Country Name", coverImage : "https://cdn.britannica.com/37/245037-050-79129D52/world-map-continents-oceans.jpg",authorId : 1,
        words : {
            create : [
                { word : "Australia"},
                { word : "Belgium"},
                { word : "Malaysia"},
                { word : "Brazil"},
                { word : "Cambodia"},
                { word : "China"},
                { word : "Egypt"},
                { word : "Germany"},
                { word : "Korea"},
                { word : "Russia"},
            ]
        }
    }
    
    
const collectionData3 =
    {
        title : "Animal",description : "This is collection of popular animal in the world",authorId : 2,
        words :{
            create :[
                { word : "Tiger"},
                { word : "Shark"},
                { word : "Lion"},
                { word : "Capybara"},
                { word : "Hippopotamus"},
                { word : "Butterfly"},
                { word : "Panda"},
                { word : "Dog"},
                { word : "Cat"},
                { word : "Rhino"},
            ]
        }
    }


console.log("Database Reset")

async function run(){
    await prisma.user.createMany({
        data : userData
    })
    await prisma.collection.create({
        data : collectionData1
    })
    await prisma.collection.create({
        data : collectionData2
    })
    await prisma.collection.create({
        data : collectionData3
    })
}

run()