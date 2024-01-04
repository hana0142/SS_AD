const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('result_check4', {
    check4_id: {
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
    left_result_check4: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    right_result_check4: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    check_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'result_check4',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "result_check4_pkey",
        unique: true,
        fields: [
          { name: "check4_id" },
        ]
      },
    ]
  });
};
