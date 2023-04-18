const app = require('./app')
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: './config.env' });

const port = process.env.PORT || 3000;
// const DB = process.env.DATABASE_URL.replace('<password>', process.env.DATABASE_PASSWORD)

// mongoose.connect(DB).then(() => {
//     console.log("DATABASE CONNECTED SUCCESSFULLY..")
// }).catch(err => {
//     console.log("Ooooooops Database not connected", err)
// })

app.listen(port, () => {
    console.log(`App is listening to port:${port}`)
})