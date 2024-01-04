const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('result_check7', {
    check7_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    check_no: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    left_result_check7: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    right_result_check7: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    check_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'result_check7',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "result_check7_pkey",
        unique: true,
        fields: [
          { name: "check7_id" },
        ]
      },
    ]
  });
};
