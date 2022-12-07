const models = require('../../models');
const jwt = require('jsonwebtoken');
const _ = require('underscore');
const fs = require('fs');
const {scryptSync, randomBytes} = require('crypto');
const commonService = require('../../services/commonService');


module.exports = {
	login: async (req, res) => {
		try{
			const params = _.extend(req.query || {}, req.params || {}, req.body || {});

			// check if email exists...
			let admin_data = await models.hotel_user.findOne({where: {email: params.loginEmail}, raw: true});

			if(!admin_data){
				res.json({status: false, message: "User does not exists."})
			}else if(admin_data.is_active == '0'){// if user is deactivated...
				res.json({status: false, message: 'This account has been disabled.'})
			}else{//matching password...
				const [salt, key] = admin_data.password.split(':');
				const passHash = scryptSync(params.loginPassword, salt, 64).toString('hex');
				if(passHash == key){
					// password matched, generating signing token with database id...
					const token = jwt.sign({id: admin_data.id}, "gEGO1ZGxdAvwwPN7Ce6NstfHUEwBtVEbXPz", {
		                expiresIn: 2592000 // expires in 30 Days
	                });

	                res.cookie('token', token, {maxAge: 2592000000, httpOnly: true});
	                delete admin_data.createdAt;
	                delete admin_data.updatedAt;
	                delete admin_data.password;
	                delete admin_data.is_active;
	                // updating session data...
	                req.session.admin_data = admin_data;
					res.json({status: true, message: 'Login successful', admin_data, token});
				}else{
					res.json({status: false, message: 'Password is incorrect.'});
				}
			}
		}catch(e){
			console.log(e);
			res.json({status: false, message: 'Some error occured while logging in.'});
		}
	},

	logout:async (req, res)=>{
	    try{
		    req.session.destroy();
		    req.admin_data = null;
		    res.clearCookie("token");
		    res.json({status:true, message:"Logout successfull"});
	    }catch(e){
	      	res.json({status: false, message: "failed to log out"});
	    }
	},

	// for adding or editing moderator
	addModerator: async (req, res) => {
		try{
			const params = _.extend(req.query || {}, req.params || {}, req.body || {});

			if(params.id){
				// editing moderator
				let userUpdated = await models.hotel_user.update({email: params.userEmail.trim(), first_name: params.firstName.trim(), last_name: params.lastName.trim()}, {where: {id: params.id}});

				if(userUpdated[0] == 1){
					res.json({status: true, message: 'User updated successfully.'});
				}else{
					res.json({status: false, message: 'Cannot update user. Please try again later.'})
				}
			}else{
				// creating moderator
				const salt = randomBytes(16).toString('hex');
				const passHash = scryptSync(params.userPassword, salt, 64).toString('hex');

				let newUser = await models.hotel_user.create({email: params.userEmail.trim(), first_name: params.firstName.trim(), last_name: params.lastName.trim(), user_type: 2, password: `${salt}:${passHash}`});

				if(newUser){
					res.json({status: true, message: 'Moderator created successfully'});
				}else{
					res.json({status: false, message: 'Cannot create moderator, please try again later.'});
				}
			}
		}catch(e){
			console.log(e);
			if(e.original?.sqlMessage){
				if(e.original.sqlMessage.slice(0, 15) == 'Duplicate entry'){
					if(Object.keys(e.fields)[0] == 'email'){
						res.json({status: false, message: 'Email address already exists.'});
						return -1;
					}
				}
			}
			if(params.id){
				res.json({status: false, message: 'Failed to update user.'});
			}else{
				res.json({status: false, message: 'Failed to create moderator.'});
			}
		}
	},

	moderatorList: async (req, res) => {
		try{
			const params = _.extend(req.query || {}, req.params || {}, req.body || {});

			let moderatorListData = await models.hotel_user.findAll({where: {user_type: 2}, raw: true});

			if(moderatorListData){
				res.json({status: true, message: 'Success', data: moderatorListData});
			}else{
				res.json({status: false, message: 'Failed to get moderator list data. Please try again later.'});
			}
		}catch(e){
			console.log(e);
			res.json({status: false, message: 'Failed to get moderator list data.'});
		}
	},

	// for adding or updating room type
	addRoomType: async (req, res) => {
		try{
			const params = _.extend(req.query || {}, req.params || {}, req.body || {});

			if(params.id){
				// updating room type
				let roomUpdated = await models.hotel_room_type.update({type_name: params.typeName}, {where: {id: params.id}});

				if(roomUpdated){
					res.json({status: true, message: 'Room type updated successfully'});
				}else{
					res.json({status: false, message: 'Cannot update room type, please try again later.'});
				}
			}else{
				// adding room type
				let newRoomType = await models.hotel_room_type.create({type_name: params.typeName, is_active: 1});

				if(newRoomType){
					res.json({status: true, message: 'Room type created successfully'});
				}else{
					res.json({status: false, message: 'Cannot create new room type, please try again later.'});
				}
			}
		}catch(e){
			console.log(e);
			if(params.id){
				res.json({status: false, message: 'Failed to update room type.'});
			}else{
				res.json({status: false, message: 'Failed to create new room type.'});
			}
		}
	},

	roomTypeList: async (req, res) => {
		try{
			const params = _.extend(req.query || {}, req.params || {}, req.body || {});

			let whereObj = {};

			if(params.isActive){
				whereObj['is_active'] = params.isActive;
			}

			let roomTypeListData = await models.hotel_room_type.findAll({where: whereObj, raw: true});

			if(roomTypeListData){
				res.json({status: true, message: 'Success', data: roomTypeListData});
			}else{
				res.json({status: false, message: 'Failed to get room type list data. Please try again later.'});
			}
		}catch(e){
			console.log(e);
			res.json({status: false, message: 'Failed to get room type list data.'});
		}
	},

	addRoom: async (req, res) => {
		try{
			const params = _.extend(req.query || {}, req.params || {}, req.body || {});

			if(params.id){
				let roomUpdated = await models.hotel_room.update({type_id: params.roomType, price: params.roomPrice, quantity: params.roomQuantity, description: params.roomDescription}, {where: {id: params.id}});

				if(roomUpdated){
					res.json({status: true, message: 'Room updated successfully'});
				}else{
					res.json({status: false, message: 'Cannot update room, please try again later.'});
				}
			}else{
				let newRoom = await models.hotel_room.create({type_id: params.roomType, price: params.roomPrice, quantity: params.roomQuantity, description: params.roomDescription, is_active: 1});

				if(newRoom){
					res.json({status: true, message: 'Room created successfully'});
				}else{
					res.json({status: false, message: 'Cannot create new room, please try again later.'});
				}
			}
		}catch(e){
			console.log(e);
			if(params.id){
				res.json({status: false, message: 'Failed to updated room.'});
			}else{
				res.json({status: false, message: 'Failed to create new room.'});
			}
		}
	},

	roomList: async (req, res) => {
		try{
			const params = _.extend(req.query || {}, req.params || {}, req.body || {});

			let roomListData = await models.hotel_room.findAll({raw: true});

			let roomTypeListData = await models.hotel_room_type.findAll({raw: true});

			roomTypeListData.sort((a, b) => a.id-b.id);

			for(let record of roomListData){
				// this takes nlog(m) time where n is length of roomListData and m is length of roomTypeListData
				let upperBound = roomTypeListData.length;
				let lowerBound = 0;
				let index = parseInt(upperBound/2);
				while(record.type_id!=roomTypeListData[index].id){
					if(record.type_id>roomTypeListData[index].id){
						let temp = lowerBound;
						lowerBound = index;
						index += parseInt((upperBound-index)/2)==0?1:parseInt((upperBound-index)/2);
					}else if(record.type_id<roomTypeListData[index].id){
						let temp = upperBound;
						upperBound = index;
						index -= parseInt((index-lowerBound)/2)==0?1:parseInt((index-lowerBound)/2);
					}
				}
				record.room_type = roomTypeListData[index].type_name;
			}

			if(roomListData){
				res.json({status: true, message: 'Success', data: roomListData});
			}else{
				res.json({status: false, message: 'Failed to get room list data. Please try again later.'});
			}
		}catch(e){
			console.log(e);
			res.json({status: false, message: 'Failed to get room list data.'});
		}
	},

	uploadRoomPic: async (req, res) => {
		try{
			const params = _.extend(req.query || {}, req.params || {}, req.body || {}, req.file || {}, req.files || {});

			const roomImageUpload = await models.hotel_room_image.create({room_id: params.roomId, original_file_name: params.originalname, file_name: params.filename, file_path: params.path, destination: params.destination, file_size: params.size, file_type: params.mimetype, /*s3_ETag: params.etag*/});

			if(roomImageUpload){
				res.json({status: true, message: 'Room image uploaded successfully'});
			}else{
				res.json({status: false, message: 'Unable to upload room image, please try again'});
			}
		}catch(e){
			console.log(e);
			res.json({status: false, message: 'Unable to upload room image'});
		}
	},

	approveBookRequest: async (req, res) => {
		try{
			const params = _.extend(req.query || {}, req.params || {}, req.body || {});

			let dateNow = commonService.getDateForDb(new Date(Date.now()-1000*60*60*24));

			let approveListQuery = `SELECT hotel_room_bookings.id, hotel_room_bookings.user_id, hotel_room_bookings.user_email, hotel_room_bookings.quantity, hotel_room_bookings.from_time, hotel_room_bookings.till_time, hotel_rooms.price AS price_per_room, hotel_room_types.type_name
				FROM hotel_room_bookings 
				LEFT JOIN hotel_rooms ON hotel_room_bookings.room_id = hotel_rooms.id
				LEFT JOIN hotel_room_types ON hotel_room_types.id = hotel_rooms.type_id
				WHERE is_confirmed IS null AND booking_token_expire > '${dateNow}' AND is_cancelled IS null`;

			let approveListData = await models.sequelize.query(approveListQuery);
			approveListData = approveListData[0];

			if(approveListData){
				res.json({status: true, message: 'Success', data: approveListData});
			}else{
				res.json({status: false, message: 'Failed to get approve list data. Please try again later.'});
			}
		}catch(e){
			console.log(e);
			res.json({status: false, message: 'Failed to get approve list data.'});
		}
	},

	approveRequest: async (req, res) => {
		try{
			const params = _.extend(req.query || {}, req.params || {}, req.body || {});

			let isApproved = await models.hotel_room_booking.update({is_confirmed: 1, confirmed_by: req.session.admin_data.id, confirm_time: new Date()}, {where: {id: params.id}});

			if(isApproved[0] == 1){
				if(params.userEmail != 'null'){
					commonService.sendBookMail({email: params.userEmail, firstName: 'Dear'});
				}else if(params.userId){
					let userData = await models.hotel_user.findOne({where: {id: params.userId}, raw: true});
					commonService.sendBookMail({email: userData.email, firstName: userData.firstName});
				}
				res.json({status: true, message: 'Book request approved successfully.'});
			}else{
				res.json({status: false, message: 'Failed to approve book request. Please try again later.'});
			}
		}catch(e){
			console.log(e);
			res.json({status: false, message: 'Failed to approve book request.'});
		}
	},

	deleteImage: async (req, res) => {
		try{
			const params = _.extend(req.query || {}, req.params || {}, req.body || {});

			let imageDeleted = await models.hotel_room_image.destroy({where: {id: params.imageId}});

			if(imageDeleted){
				res.json({status: true, message: 'Image deleted successfully.'});
			}else{
				res.json({status: false, message: 'Failed to delete image. Please try again later.'});
			}
		}catch(e){
			console.log(e);
			res.json({status: false, message: 'Failed to delete image.'});
		}
	},

	deleteRoom: async (req, res) => {
		try{
			const params = _.extend(req.query || {}, req.params || {}, req.body || {});

			let imageDeleted = await models.hotel_room_image.destroy({where: {room_id: params.roomId}});

			if(!imageDeleted){
				res.json({status: false, message: 'There is some error in deleting room. Please try again later.'});
				return -1;
			}

			let bookingsUpdated = await models.hotel_room_booking.update({room_id: null}, {where: {room_id: params.roomId}});

			if(!bookingsUpdated){
				res.json({status: false, message: 'There is some error in deleting room. Please try again later.'});
				return -1;
			}

			let roomDeleted = await models.hotel_room.destroy({where: {id: params.roomId}});

			if(roomDeleted){
				res.json({status: true, message: 'Room deleted successfully.'});
			}else{
				res.json({status: false, message: 'Failed to delete room. Please try again later.'});
			}
		}catch(e){
			console.log(e);
			res.json({status: false, message: 'Failed to delete room.'});
		}
	},
}