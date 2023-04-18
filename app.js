const express = require("express");
const logger = require("morgan")
const path = require("path")

// Import routes and errorHandler
const videoRoute = require("./routes/videoRoute")
const errorHandler = require("./controllers/errorFactory")

// Intialize appliction
const app = express();

// Middlewares
app.use(express.json())
app.use(express.static(path.join(__dirname, "files")))
app.use(logger('dev'))

app.use("/api/videoUpload", videoRoute)
app.use('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})
app.use(errorHandler)

module.exports = app;