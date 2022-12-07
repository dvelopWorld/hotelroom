var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const models = require('../models');


const userApi = require('../controllers/user/userApi');
const userView = require('../controllers/user/userView');


const checkUserSession = (req, res, next) => {
  if(req.session.user_data?.id){
    next();
  }else{
    res.redirect('/');
  }
}


const checkToken = (req, res, next) => {
  const token = req.cookies.token;

  if(!token) return res.status(401).send({auth: false, message: 'No token provided.'});
  
  jwt.verify(token, "gEGO1ZGxdAvwwPN7Ce6NstfHUEwBtVEbXPz", async (err, decoded) => {
    if(err) return res.status(401).send({auth: false, message: 'Failed to authenticate token.'});
    console.log('decod',decoded);
    // await models.hotel_user.findOne({where:{id: decoded.id}, raw: true}).then(async (data)=>{
    //   req.user_data = data;
    // });
    next();
  });
}



/* views */
// checking session for authorization
router.get('/', userView.dashboard);
router.get('/login', userView.login);
router.get('/register', userView.register);
router.get('/user-booked-rooms', checkUserSession, userView.userBookedRooms);
router.get('/edit-booking', checkUserSession, userView.editBooking);


// actions
// checking token for confidentiality
router.put('/login', userApi.login);
router.put('/logout', userApi.logout);
router.post('/register', userApi.register);
router.put('/get-room-data', userApi.getRoomData);
router.post('/book-room', userApi.bookRoom);
router.put('/user-booked-rooms', checkToken, userApi.userBookedRooms);
router.put('/cancel-booking', checkToken, userApi.cancelBooking);
router.put('/edit-booking', checkToken, userApi.editBooking);
router.put('/update-booking', checkToken, userApi.updateBooking);

module.exports = router;
