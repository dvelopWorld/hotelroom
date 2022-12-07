const multer = require("multer");
const _ = require("underscore");
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const params = _.extend(req.query || {}, req.params || {}, req.body || {});
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const params = _.extend(req.query || {}, req.params || {}, req.body || {});
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

// //Filter the image type
// const imageFileFilter = (req, file, cb) =>{
//   if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
//     req.fileValidationError = "You can upload only image files";
//     return cb(null,false, req.fileValidationError);
//   }
//   cb(null, true);
// };

//Here we configure what our storage and filefilter will be, which is the storage and imageFileFilter we created above
exports.upload = multer({storage: storage});