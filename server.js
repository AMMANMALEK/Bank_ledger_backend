require("dotenv").config()
const connectToDB = require("./src/config/db")

const app = require("./src/app")
connectToDB();

app.listen(3000 , ()=>{
    console.log("server is running at  port 3000")

})