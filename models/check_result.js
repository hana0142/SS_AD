const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('check_result', {
    check_no: {
      type: DataTypes.STRING(256),
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    left_check_result: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    right_check_result: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    check_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    total_result: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('now')
    }
  }, {
    sequelize,
    tableName: 'check_result',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "check_result_pkey",
        unique: true,
        fields: [
          { name: "check_no" },
        ]
      },
    ]
  });
};
