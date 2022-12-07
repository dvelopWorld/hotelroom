'use strict';

module.exports = (sequelize, DataTypes) => {
	var hotel_room_image = sequelize.define('hotel_room_image',{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			unique: true,
			autoIncrement: true
		},

    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    original_file_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },

    file_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },

    file_path: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },

    destination: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },

    file_size: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },

    file_type: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },

    is_featured: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0,
    },

    is_thumbnail: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0,
    },

    s3_ETag: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
	});

	return hotel_room_image;
}