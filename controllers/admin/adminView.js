const models = require("../../models");
const _ = require("underscore");


module.exports = {
	dashboard: async (req, res) => {
		const params = _.extend(req.query || {}, req.params || {}, req.body || {});
		try{
			let title = "Admin Dashboard - Hotel Inn";
			res.render('pages/admin/admin_dashboard', {title});
		}catch(e){
			console.log(e);
			res.json({status: false, message: "Failed to load page"});
		}
	},

	login: async (req, res) => {
        try{
            if(!req.session.admin_data){
                let title = `Login - Hotel Inn`;
                res.render('pages/admin/login', {layout:false, title});
            }else{
                res.redirect('/admin');
            }
        }catch(e){
        	console.log(e);
            res.json({status: false, message: "Failed to load page"});
        }
    },

    addModerator: async (req, res) => {
        try{
        	const params = _.extend(req.query || {}, req.params || {}, req.body || {});

            let title = `Add Moderator - Hotel Inn`;
            res.render('pages/admin/add_moderator', {title, userData: ''});
        }catch(e){
        	console.log(e);
            res.json({status: false, message: "Failed to load page"});
        }
    },

    editModerator: async (req, res) => {
        try{
        	const params = _.extend(req.query || {}, req.params || {}, req.body || {});

            const title = `Edit Moderator - Hotel Inn`;

            const userData = await models.hotel_user.findOne({where: {id: params.id}, raw: true});

            res.render('pages/admin/add_moderator', {title, userData});
        }catch(e){
        	console.log(e);
            res.json({status: false, message: "Failed to load page"});
        }
    },

    moderatorList: async (req, res) => {
        try{
        	const params = _.extend(req.query || {}, req.params || {}, req.body || {});

            let title = `Moderator List - Hotel Inn`;
            res.render('pages/admin/moderator_list', {title});
        }catch(e){
        	console.log(e);
            res.json({status: false, message: "Failed to load page"});
        }
    },

    addRoomType: async (req, res) => {
        try{
        	const params = _.extend(req.query || {}, req.params || {}, req.body || {});

            let title = `Add Room Type - Hotel Inn`;
            res.render('pages/admin/add_room_type', {title, roomTypeData: ''});
        }catch(e){
        	console.log(e);
            res.json({status: false, message: "Failed to load page"});
        }
    },

    roomTypeList: async (req, res) => {
        try{
        	const params = _.extend(req.query || {}, req.params || {}, req.body || {});

            let title = `Room Type List - Hotel Inn`;
            res.render('pages/admin/room_type_list', {title});
        }catch(e){
        	console.log(e);
            res.json({status: false, message: "Failed to load page"});
        }
    },

    editRoomType: async (req, res) => {
        try{
        	const params = _.extend(req.query || {}, req.params || {}, req.body || {});

            const title = `Edit Room Type - Hotel Inn`;

            const roomTypeData = await models.hotel_room_type.findOne({where: {id: params.id}, raw: true});

            res.render('pages/admin/add_room_type', {title, roomTypeData});
        }catch(e){
        	console.log(e);
            res.json({status: false, message: "Failed to load page"});
        }
    },

    addRoom: async (req, res) => {
        try{
        	const params = _.extend(req.query || {}, req.params || {}, req.body || {});

            let title = `Add Room - Hotel Inn`;
            res.render('pages/admin/add_room', {title, roomData: ''});
        }catch(e){
        	console.log(e);
            res.json({status: false, message: "Failed to load page"});
        }
    },

    roomList: async (req, res) => {
        try{
        	const params = _.extend(req.query || {}, req.params || {}, req.body || {});

            let title = `Room List - Hotel Inn`;
            res.render('pages/admin/room_list', {title});
        }catch(e){
        	console.log(e);
            res.json({status: false, message: "Failed to load page"});
        }
    },

    editRoom: async (req, res) => {
        try{
        	const params = _.extend(req.query || {}, req.params || {}, req.body || {});

            const title = `Edit Room - Hotel Inn`;

            const roomData = await models.hotel_room.findOne({where: {id: params.id}, raw: true});

            res.render('pages/admin/add_room', {title, roomData});
        }catch(e){
        	console.log(e);
            res.json({status: false, message: "Failed to load page"});
        }
    },

    roomImage: async (req, res) => {
        try{
        	const params = _.extend(req.query || {}, req.params || {}, req.body || {});

            let title = `Room Images - Hotel Inn`;
            let roomImageData = await models.hotel_room_image.findAll({where: {room_id: params.id}, raw: true});

            res.render('pages/admin/room_images', {title, id: params.id, roomImageData});
        }catch(e){
        	console.log(e);
            res.json({status: false, message: "Failed to load page"});
        }
    },

    approveBookRequest: async (req, res) => {
        try{
            const params = _.extend(req.query || {}, req.params || {}, req.body || {});

            let title = `Approve Book Request - Hotel Inn`;
            res.render('pages/admin/approve_book_request', {title});
        }catch(e){
            console.log(e);
            res.json({status: false, message: "Failed to load page"});
        }
    }
}