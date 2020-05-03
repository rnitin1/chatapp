const multer = require('multer');
const User = require('../models/user')


//Creating the filename
let fileName = new Date().getTime()


// function for image only files
let imageFilter = function (req, file, cb) {
    console.log(req.file);
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Allocating the storage for images
const storage = multer.diskStorage({
    destination:"./uploader",
     filename(req,file,cb){
        cb(null,fileName+ '.gif')
    }
})

// Initializing multer Upload
const upload = multer({
    storage: storage,
    limits:{fileSize: 10000000},
    fileFilter: imageFilter
  }).single('image');

//uploading image
exports.uploadimage= async (req, res) => {
    upload(req, res, (err) => {
      if(err){
        res.send(err);
      } else {
        if(req.file == undefined){
          res.send('Error: No File Selected!');
        } else {
          console.log(req.file.filename);
          //Updating the user image in the database
          let dataToSet = {
            $set: {
            image:req.file.filename
            }
          }
          User.update(dataToSet)
          res.send( 'File Uploaded!');
        }
      }
    });
};

