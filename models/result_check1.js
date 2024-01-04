const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('result_check1', {
    check1_id: {
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
    left_result_check1: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    right_result_check1: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    check_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'result_check1',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "result_check1_pkey",
        unique: true,
        fields: [
          { name: "check1_id" },
        ]
      },
    ]
  });
};
