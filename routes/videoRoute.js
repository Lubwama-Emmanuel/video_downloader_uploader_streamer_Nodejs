const express = require("express")
const route = express.Router();
const videoController = require('../controllers/videoController');

route.post("/upload", videoController.video, videoController.uploadVideo)
route.post("/streamVideo", videoController.streamVideo)
route.post("/download", videoController.downloadVideo)

module.exports = route;