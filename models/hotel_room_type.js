'use strict';

module.exports = (sequelize, DataTypes) => {
	const hotel_room_type = sequelize.define('hotel_room_type', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			unique: true,
			autoIncrement: true,
		},

		type_name: {
			type: DataTypes.STRING(20),
			allowNull: false,
			unique: true,
		},

		is_active: {
			type: DataTypes.TINYINT,
			allowNull: false,
			defaultValue: 1,
		},
	},

	{
		indexes: [
			{
				name: 'type_name',
				unique: true,
				fields: ['type_name'],
			}
		]
	});

	return hotel_room_type;
}