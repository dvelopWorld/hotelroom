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
			let user_data = await models.hotel_user.findOne({where: {email: params.loginEmail}, raw: true});

			if(!user_data){
				res.json({status: false, message: "User does not exists."})
			}else{//matching password...
				const [salt, key] = user_data.password.split(':');
				const passHash = scryptSync(params.loginPassword, salt, 64).toString('hex');
				if(passHash == key){
					// password matched, generating signing token with database id...
					const token = jwt.sign({id: user_data.id}, "gEGO1ZGxdAvwwPN7Ce6NstfHUEwBtVEbXPz", {
		                expiresIn: 2592000 // expires in 30 Days
	                });

	                res.cookie('token', token, {maxAge: 2592000000, httpOnly: true});
	                delete user_data.createdAt;
	                delete user_data.updatedAt;
	                delete user_data.user_type;
	                delete user_data.password;
	                delete user_data.is_active;
	                // updating session data...
	                req.session.user_data = user_data;
					res.json({status: true, message: 'Login successful', user_data, token});
				}else{
					res.json({status: false, message: 'Password is incorrect.'});
				}
			}
		}catch(e){
			console.log(e);
			res.json({status: false, message: 'Some error occured while logging in.'});
		}
	},

	register: async (req, res) => {
		const params = _.extend(req.query || {}, req.params || {}, req.body || {});

		const salt = randomBytes(16).toString('hex');
		const passHash = scryptSync(params.userPassword, salt, 64).toString('hex');
		
		try{
			// creating user
			let newUser = await models.hotel_user.create({email: params.userEmail.trim(), first_name: params.firstName.trim(), last_name: params.lastName.trim(), user_type: 3, password: `${salt}:${passHash}`});

			if(newUser){
				res.json({status: true, message: 'Account created successfully'});
				commonService.sendRegisterMail(newUser);
			}else{
				res.json({status: false, message: 'Cannot create new account, please try again later.'});
			}
		}catch(e){
			console.log(e);
			if(e.original?.sqlMessage){
				if(e.original.sqlMessage.slice(0, 15) == 'Duplicate entry'){
					if(Object.keys(e.fields)[0] == 'email'){
						let user_data = await models.hotel_user.findOne({where: {email: params.userEmail}, raw: true});

						if(user_data.user_type == 4){
							// sinse user can book room without login, we ask their email and store it with guest account.
							// updating user to a customer
							// this is not in use as we are storing the email address in booking table.
							
							let newUser = await models.hotel_user.update({first_name: params.firstName.trim(), last_name: params.lastName.trim(), user_type: 3, password: `${salt}:${passHash}`}, {where: {id: user_data.id}});

							if(newUser[0] == 1){
								res.json({status: true, message: 'Account created successfully'});
								commonService.sendRegisterMail({email: user_data.email, first_name: params.firstName});
							}else{
								res.json({status: false, message: 'Cannot create new account, please try again later.'});
							}
							return 0;
						}else{
							res.json({status: false, message: 'Email address already exists.'});
							return -1;
						}
					}
				}
			}
			res.json({status: false, message: 'Failed to create new account.'});
		}
	},

	getRoomData: async (req, res) => {
		try{
			const params = _.extend(req.query || {}, req.params || {}, req.body || {});

			let roomData = await commonService.getAvailableRooms(params.fromDate, params.tillDate);

			let roomImages = await models.hotel_room_image.findAll({group: ['room_id'], raw: true});

        	roomImages.sort((a, b) => a.id-b.id);

        	for(let record of roomData){
	            for(let roomImage of roomImages){
	            	if(roomImage.room_id == record.id){
	            		record.file_path = roomImage.file_path;
	            	}
	            }
	        }

			res.json({status: true, message: 'Success', data: roomData});
		}catch(e){
			console.log(e);
			res.json({status: false, message: 'Cannot get room data'});
		}
	},

	logout: async (req, res) => {
	    try{
		    req.session.destroy();
		    req.user_data = null;
		    res.clearCookie("token");
		    res.clearCookie("userToken");
		    res.json({status: true, message: "Logout successfull"});
	    }catch(e){
	      	res.json({status: false, message: "failed to log out"});
	    }
	},

	bookRoom: async (req, res) => {
	    try{
	    	const params = _.extend(req.query || {}, req.params || {}, req.body || {});

	    	// get tommorow's date
	    	let dateNow = commonService.getDateForDb(new Date(Date.now()+1000*60*60*24));

			let token = '';
	        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	        let charactersLength = characters.length;
	        for(let i = 0; i < 20; i++){
	          token += characters.charAt(Math.floor(Math.random() * charactersLength));
	        }

			let roomBooked = await models.hotel_room_booking.create({user_id: req.session.user_data?.id, user_email: params.bookEmail, room_id: params.roomId, quantity: params.bookQuantity, from_time: params.fromDate, till_time: params.tillDate, booking_token: token, booking_token_expire: dateNow});

			if(roomBooked){
				res.json({status:true, message:"Room Booked Successfully"});
			}else{
				res.json({status:false, message:"cannot book room, please try later"});
			}
	    }catch(e){
	    	console.log(e);
	      	res.json({status: false, message: "failed to book room"});
	    }
	},

	userBookedRooms: async (req, res) => {
	    try{
	    	const params = _.extend(req.query || {}, req.params || {}, req.body || {});

			let roomBooked = await models.sequelize.query(`SELECT hotel_room_bookings.id, hotel_room_bookings.user_id, hotel_room_bookings.quantity, hotel_room_bookings.from_time, hotel_room_bookings.till_time, hotel_room_bookings.is_confirmed, hotel_room_bookings.is_cancelled, hotel_room_bookings.cancel_time, hotel_room_types.type_name
				FROM hotel_room_bookings
				LEFT JOIN hotel_rooms ON hotel_rooms.id = hotel_room_bookings.room_id
				LEFT JOIN hotel_room_types ON hotel_room_types.id = hotel_rooms.type_id
				WHERE hotel_room_bookings.user_id = ${req.session.user_data.id};`);
			roomBooked = roomBooked[0];

			if(roomBooked){
				res.json({status:true, message:"success", roomBooked});
			}else{
				res.json({status:false, message:"cannot get booked room data"});
			}
	    }catch(e){
	    	console.log(e);
	      	res.json({status: false, message: "failed to get booked room data"});
	    }
	},

	cancelBooking: async (req, res) => {
		try{
			const params = _.extend(req.query || {}, req.params || {}, req.body || {});

			let bookingCancelled = await models.hotel_room_booking.update({is_cancelled: 1, cancel_time: new Date()}, {where: {id: params.bookingId}});

			if(bookingCancelled[0] == 1){
				res.json({status: true, message: 'Booking cancelled successfully.'})
			}else{
				res.json({status: false, message: 'Cannot cancel booking. Please try again later.'})
			}
		}catch(e){
			console.log(e);
			res.json({status: false, message: 'Cannot cancel booking.'})
		}
	},

	editBooking: async (req, res) => {
		try{
			const params = _.extend(req.query || {}, req.params || {}, req.body || {});

			let bookingData = await models.hotel_room_booking.findOne({where: {id: params.bookingId}, raw: true});

			if(bookingData){
				res.json({status: true, message: 'Success.', data: bookingData})
			}else{
				res.json({status: false, message: 'Cannot get booking data. Please try again later.'})
			}
		}catch(e){
			console.log(e);
			res.json({status: false, message: 'Cannot get booking data.'})
		}
	},

	updateBooking: async (req, res) => {
		try{
			const params = _.extend(req.query || {}, req.params || {}, req.body || {});

			let bookingUpdated = await models.hotel_room_booking.update({from_time: params.fromDate, till_time: params.tillDate}, {where: {id: params.bookingId}, raw: true});

			if(bookingUpdated[0] == 1){
				res.json({status: true, message: 'Booking updated successfully.'})
			}else{
				res.json({status: false, message: 'Cannot update booking. Please try again later.'})
			}
		}catch(e){
			console.log(e);
			res.json({status: false, message: 'Cannot update booking.'})
		}
	},
}