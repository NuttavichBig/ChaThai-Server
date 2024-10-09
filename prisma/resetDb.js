require('dotenv').config()

const prisma = require("../src/config/prisma")

async function run() {
    await prisma.$executeRawUnsafe('DROP DATABASE ChaThai')
    await prisma.$executeRawUnsafe('CREATE DATABASE ChaThai')
}

console.log("Reset DB")
run()