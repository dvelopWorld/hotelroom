'use strict';

module.exports = (sequelize, DataTypes) => {
	const hotel_room_booking = sequelize.define('hotel_room_booking', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			unique: true,
			autoIncrement: true,
		},

		user_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: null,
		},

		user_email: {
			type: DataTypes.STRING(30),
			allowNull: true,
			defaultValue: null,
		},

		room_id: {
			type: DataTypes.INTEGER,
		},

		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},

		from_time: {
			type: DataTypes.DATE,
			allowNull: false,
		},

		till_time: {
			type: DataTypes.DATE,
			allowNull: false,
		},

		booking_token:{
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null,
		},

		booking_token_expire:{
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null
		},

		is_cancelled: {
			type: DataTypes.TINYINT,
			defaultValue: null,
		},

		cancel_time: {
			type: DataTypes.DATE,
			defaultValue: null,
		},

		is_confirmed: {
			type: DataTypes.TINYINT,
			defaultValue: null,
		},

		confirm_time: {
			type: DataTypes.DATE,
			defaultValue: null,
		},

		confirmed_by: {
			type: DataTypes.TINYINT,
			defaultValue: null,
		}
	});

	return hotel_room_booking;
}