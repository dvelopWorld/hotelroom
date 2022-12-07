const models = require('../../models');
const jwt = require('jsonwebtoken');
const _ = require('underscore');
const fs = require('fs');
const layout = 'layouts/front-layout';


module.exports = {
	dashboard: async (req, res, next) => {
		try{
			const params = _.extend(req.query || {}, req.params || {}, req.body || {});
			let title = "Dashboard - Hotel Inn"
			res.render("pages/front/user_dashboard", {title, layout});
		}catch(e){
			console.log("err", e);
			res.json({status: false});
		}
	},

	login: async (req, res) => {
        try{
            if(!req.session.user_data){
                let title = `Login - Hotel Inn`;
                res.render('pages/front/login', {title, layout});
            }else{
                res.redirect('/');
            }
        }catch(e){
        	console.log(e);
            res.json({status: false, message: "Failed to load page"});
        }
    },

    register: async (req, res) => {
        try{
            if(!req.session.user_data){
                let title = `Register - Hotel Inn`;
                res.render('pages/front/register', {title, layout});
            }else{
                res.redirect('/');
            }
        }catch(e){
        	console.log(e);
            res.json({status: false, message: "Failed to load page"});
        }
    },

    userBookedRooms: async (req, res) => {
        try{
            let title = `User Booked Rooms - Hotel Inn`;
            res.render('pages/front/user_booked_rooms', {title, layout});
        }catch(e){
            console.log(e);
            res.json({status: false, message: "Failed to load page"});
        }
    },

    editBooking: async (req, res) => {
        try{
            let title = `Edit Booking - Hotel Inn`;
            res.render('pages/front/edit_booking', {title, layout});
        }catch(e){
            console.log(e);
            res.json({status: false, message: "Failed to load page"});
        }
    },
}