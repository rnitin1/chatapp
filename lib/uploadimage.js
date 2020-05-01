const multer = require('multer');
const path = require('path');
const ejs = require('ejs')

let fileName = new Date().getTime()

let imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

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
exports.uploadimage= (req, res) => {
    upload(req, res, (err) => {
      if(err){
        res.render('index', {
          msg: err
        });
      } else {
        if(req.file == undefined){
          res.render('index', {
            msg: 'Error: No File Selected!'
          });
        } else {
          res.render('index', {
            msg: 'File Uploaded!',
            file: `uploads/${req.file.filename}`
          });
        }
      }
    });
};

  exports.renderimage =(req,res)=>{
      res.render('index')
  }