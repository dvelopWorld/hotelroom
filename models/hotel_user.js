'use strict';

module.exports = (sequelize, DataTypes) => {
	const hotel_user = sequelize.define('hotel_user', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			unique: true,
			autoIncrement: true,
		},

		email: {
			type: DataTypes.STRING(50),
			allowNull: false,
			unique: true,
		},

		first_name: {
			type: DataTypes.STRING(20),
			allowNull: false,
		},

		last_name: {
			type: DataTypes.STRING(20),
		},

		user_type: {
			type: DataTypes.TINYINT,
			allowNull: false,
		},

		password: {
			type: DataTypes.STRING(255),
			allowNull: false
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
				name: 'user_type',
				unique: false,
				fields: ['user_type'],
			}
		]
	});

	return hotel_user;
}