var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const models = require('../models');
const {upload} = require("../middlewares/multerUpload");


const adminView = require("../controllers/admin/adminView");
const adminApi = require("../controllers/admin/adminApi");


const checkUserSession = (req, res, next) => {
  if(req.session.admin_data){
    next();
  }else{
    res.redirect('/admin/login');
  }
}

const checkUserRole = (req, res, next) => {
  if(req.session.admin_data.user_type == 1){
    next();
  }else{
    res.redirect('/admin');
  }
}

const checkToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).send({auth: false, message: 'No token provided.'});
  
  jwt.verify(token, "gEGO1ZGxdAvwwPN7Ce6NstfHUEwBtVEbXPz", async (err, decoded) => {
    if (err) return res.status(500).send({auth: false, message: 'Failed to authenticate token.'});
    next();
  });
}



/* Here are all the views. We are checking the user session before loading the page. */
// checking session for authorization
// we also have a checkUserRole middleware for authorizing administrator
router.get('/', [checkUserSession], adminView.dashboard);
router.get('/login', adminView.login);
router.get('/add-moderator', [checkUserSession, checkUserRole], adminView.addModerator);
router.get('/edit-moderator', [checkUserSession, checkUserRole], adminView.editModerator);
router.get('/moderator-list', [checkUserSession, checkUserRole], adminView.moderatorList);
router.get('/add-room-type', [checkUserSession, checkUserRole], adminView.addRoomType);
router.get('/edit-room-type', [checkUserSession, checkUserRole], adminView.editRoomType);
router.get('/room-type-list', [checkUserSession, checkUserRole], adminView.roomTypeList);
router.get('/add-room', [checkUserSession, checkUserRole], adminView.addRoom);
router.get('/edit-room', [checkUserSession, checkUserRole], adminView.editRoom);
router.get('/room-list', [checkUserSession, checkUserRole], adminView.roomList);
router.get('/room-images', [checkUserSession, checkUserRole], adminView.roomImage);
router.get('/approve-book-request', [checkUserSession], adminView.approveBookRequest);


/* Here are all the actions. We are checking token before performing each action */
// checking token for confidentiality
router.put('/login', adminApi.login);
router.put('/logout', adminApi.logout);
router.post('/add-moderator', checkToken, adminApi.addModerator);
router.put('/moderator-list', checkToken, adminApi.moderatorList);
router.post('/add-room-type', checkToken, adminApi.addRoomType);
router.put('/room-type-list', checkToken, adminApi.roomTypeList);
router.post('/add-room', checkToken, adminApi.addRoom);
router.put('/room-list', checkToken, adminApi.roomList);
router.post('/upload-room-pic', [checkToken, upload.single("file")], adminApi.uploadRoomPic);
router.put('/approve-book-request', checkToken, adminApi.approveBookRequest);
router.put('/approve-booking', checkToken, adminApi.approveRequest);
router.delete('/delete-image', checkToken, adminApi.deleteImage);
router.delete('/delete-room', checkToken, adminApi.deleteRoom);

module.exports = router;
