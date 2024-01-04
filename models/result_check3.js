const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('result_check3', {
    check3_id: {
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
    left_result_check3: {
      type: DataTypes.CHAR(10),
      allowNull: false
    },
    right_result_check3: {
      type: DataTypes.CHAR(10),
      allowNull: true
    },
    check_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'result_check3',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "result_check3_pkey",
        unique: true,
        fields: [
          { name: "check3_id" },
        ]
      },
    ]
  });
};
