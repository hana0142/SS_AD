const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('result_check2', {
    check2_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
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
    left_result_check2: {
      type: DataTypes.CHAR(10),
      allowNull: false
    },
    right_result_check2: {
      type: DataTypes.CHAR(10),
      allowNull: true
    },
    check_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'result_check2',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "result_check2_pkey",
        unique: true,
        fields: [
          { name: "check2_id" },
        ]
      },
    ]
  });
};
