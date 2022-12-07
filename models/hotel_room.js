'use strict';

module.exports = (sequelize, DataTypes) => {
	const hotel_room = sequelize.define('hotel_room', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			unique: true,
			autoIncrement: true,
		},

		type_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},

		price: {
			type: DataTypes.DECIMAL(7, 2),
			allowNull: false,
		},

		quantity: {
			type: DataTypes.INTEGER(5),
			allowNull: false,
		},

		description: {
			type: DataTypes.TEXT,
		},

		is_active: {
			type: DataTypes.TINYINT,
			allowNull: false,
			defaultValue: 1,
		},
	});

	return hotel_room;
}