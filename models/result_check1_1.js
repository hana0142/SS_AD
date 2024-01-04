const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('result_check1_1', {
    check1_1_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    check_no: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    left_result_check1_1: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    right_result_check1_1: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    check_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'result_check1_1',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "result_check1_1_pkey",
        unique: true,
        fields: [
          { name: "check1_1_id" },
        ]
      },
    ]
  });
};
