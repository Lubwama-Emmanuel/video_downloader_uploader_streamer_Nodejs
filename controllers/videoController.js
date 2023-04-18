const Video = require('../models/videoModel');
const multer = require('multer');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const fs = require('fs');
const https = require('https');

// Destination for the uploaded video
const multerStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'files/uploads');
  },
  filename(req, file, cb) {
    const ext = file.mimetype.split('/')[1];
    const name = file.originalname.split('.')[0];

    // Return file name as exp: dancing-16376382973.mp4
    cb(null, `${name}-${Date.now()}.${ext}`);
  },
});

// Filtered uploads before to make sure its a video being uploaded
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video')) {
    cb(null, true);
  } else {
    cb(new AppError('Not a video, Please upload video', 400), false);
  }
};

// Pass the storage and filter in the multer function
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Middleware for upload video
exports.video = upload.single('video');

// Save video to database on upload
exports.uploadVideo = catchAsync(async (req, res, next) => {
  const video = await Video.create(req.file);

  res.status(200).json({
    success: 'success',
    data: {
      video,
    },
  });
});

// endpoint for streaming video
exports.streamVideo = catchAsync(async (req, res, next) => {
  // Pass video to stream
  const url = req.body;

  // Check for range in the req.headers
  const range = req.headers.range;
  // console.log(req.headers)

  // if no range provided
  if (!range) {
    next(new AppError('Range headers required', 400));
  }

  const videoPath = url;
  const videoSize = fs.statSync(videoPath).size;

  // parse range
  // Example: "bytes=23456-"

  const chunkSize = 10 ** 6; // 1MB

  // replaces all digits in range
  const start = Number(range.replace(/\D/g, ''));
  const end = Math.min(start + chunkSize, videoSize - 1);

  const contentLength = end - start + 1;

  // Headers to be returned
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'video/mp4',
  };

  // Data is sent partially
  res.writeHead(206, headers);

  const videoStream = fs.createReadStream(videoPath, { start, end });

  // create the video stream
  videoStream.pipe(res);
});

// Allow downloading video with url passed
exports.downloadVideo = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const url = req.body.url;
  // const url = "https://i.pinimg.com/564x/06/8e/2d/068e2d2a8ee8b0fe7206db770f5c9947.jpg";
  // const url = "http://localhost:9092/api/videoUpload/video"

  // test if url points to a url
  if (!url || !/https?.*?\.mp4/g.test(url)) {
    next(
      new AppError('Please provide a valid url that points to a video', 404)
    );
  } else {
    // If all passed then download video and save to files/downloads
    https.get(url, function (res) {
      const fileStream = fs.createWriteStream(
        `files/downloads/download-${Date.now()}.mp4`
      );
      res.pipe(fileStream);
      fileStream.on('finish', function () {
        fileStream.close();
        // console.log("Download Complete")
      });
    });

    // On success
    res.status(200).json({
      status: 'success',
      message: 'Download Complete',
    });
  }
});
