// Package Imports
const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')

// Routes Imports
const authRoutes = require("./routes/auth")

// Model Imports


// Constants
const MONGODB_URI = 'mongodb+srv://mahadNode:db@cluster0.yakhl.mongodb.net/parkour'
const app = express()


// Setting up Multer Storage
const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,'images')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+ '-' + file.originalname)
  }
})

// Setting up Multer File Filter
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

// Body Parser to handle json data
app.use(express.json());   //application/json

// Body Parser to handle form data (text Only)
app.use(express.urlencoded({ extended: false }))

// Setting up Multer for File Upload
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
)

// Setting up Static Folders
app.use(express.static(path.join(__dirname, 'public')))
/**
  The reason for doing this is because express assumes that the files in images folder are served as they were
  in the root folder. In our case we are looking in http://localhost:5000/images instead of http://localhost:5000/.
*/
app.use('/images', express.static(path.join(__dirname, 'images')))

// Handling CORS Error
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next() 
})

// Incoming requests flow from top to bottom.
app.use('/auth', authRoutes)
app.use((error, req, res, next) => {
  console.log(error);
  const statusCode = error.statusCode || 500;
  const message = error.message;
  const data = error.data
  res.status(statusCode).json({message: message, data: data})
})

// Connecting to Database and Starting the server
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    app.listen(5000, () => {
      console.log('Server running on Port 5000')
    })
  })
  .catch((err) => {
    console.log(err);
  })
