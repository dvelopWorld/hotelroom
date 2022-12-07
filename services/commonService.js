const nodemailer = require("nodemailer");
const models = require('../models');
const { Op } = require("sequelize");
const smtpTransport = require('nodemailer-smtp-transport');
const fs = require('fs');
const ejs = require('ejs');
const constants = require('../config/constants');


const smtpObj = {};
const authObj = {};

smtpObj.service = 'gmail';
smtpObj.secure = true;
smtpObj.host = 'smtp.google.com';

authObj.user = constants.mailEmail;
authObj.pass = constants.mailPassword;

smtpObj.auth = authObj;
smtpObj.port = 587;

const transporter = nodemailer.createTransport(smtpTransport(smtpObj));


module.exports = {

	sendRegisterMail: async (userObj) => {
		const compiled = ejs.compile(fs.readFileSync(`${require('path').resolve('views/templates/welcome_mail.html')}`, 'utf8'));

		const template = compiled({firstName: userObj.first_name});
		const subject= 'Welcome to Hotel Inn';

        const mailOptions = {
            from: authObj.user,
            to: `${userObj.email}`,
            subject: subject,
            html: template
        };

        transporter.sendMail(mailOptions, function(error, info){
          	if(error){
            	console.log('__________________________________>................error in sending the mail is here: ', error);
          	}else{
            	console.log('____________________________>............Email sent: ' + info.response);
          	}
        });
	},

    getDateForDb: (date) => {
        let theMonth = date.getMonth();
        theMonth++;
        return `${date.getFullYear()}-${theMonth}-${date.getDate()} ${date.toLocaleTimeString()}`;
    },

    getAvailableRooms: async (fromTime, tillTime) => {
        let nowDate = module.exports.getDateForDb(new Date());

        // query for getting booked rooms in a time frame
        // only the rooms which are confirm booked or which are waiting to be confirmed for not more than 24 hrs.
        let bookedRoomQuery = `SELECT *
            FROM hotel_room_bookings
            WHERE (('${fromTime}' < hotel_room_bookings.till_time AND '${fromTime}' > hotel_room_bookings.from_time) || ('${tillTime}'>hotel_room_bookings.from_time AND '${tillTime}'<hotel_room_bookings.till_time) || ('${fromTime}' < hotel_room_bookings.from_time AND '${tillTime}' > hotel_room_bookings.till_time)) AND (hotel_room_bookings.is_confirmed = 1 || hotel_room_bookings.booking_token_expire >= '${nowDate}') AND (hotel_room_bookings.is_cancelled IS null);`;


        let allRoomData = await models.hotel_room.findAll({where: {is_active: 1}, raw: true});

        let bookedRoomData = await models.sequelize.query(bookedRoomQuery);
        bookedRoomData = bookedRoomData[0];

        let roomTypeListData = await models.hotel_room_type.findAll({raw: true});

        // guilty for this O(n square) operation
        for(let rawRoom of allRoomData){
            for(let bookedRoom of bookedRoomData){
                if(bookedRoom.room_id == rawRoom.id){
                    rawRoom.quantity -= bookedRoom.quantity;
                }
            }
        }

        let availableRooms = allRoomData.filter(allRoom => allRoom.quantity>0);

        roomTypeListData.sort((a, b) => a.id-b.id);

        for(let record of availableRooms){
            // this takes nlog(m) time where n is length of availableRooms and m is length of roomTypeListData
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

        return availableRooms
    },

    sendBookMail: async (userObj) => {
        const compiled = ejs.compile(fs.readFileSync(`${require('path').resolve('views/templates/booking_mail.html')}`, 'utf8'));

        const template = compiled({firstName: userObj.first_name});
        const subject= 'Booking Confirmed - Hotel Inn';

        const mailOptions = {
            from: authObj.user,
            to: `${userObj.email}`,
            subject: subject,
            html: template
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log('__________________________________>................error in sending the mail is here: ', error);
            }else{
                console.log('____________________________>............Email sent: ' + info.response);
            }
        });
    },
}