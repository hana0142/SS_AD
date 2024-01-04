const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('eye_desease_code', {
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(256),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'eye_desease_code',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "eye_desease_code_pkey",
        unique: true,
        fields: [
          { name: "code" },
        ]
      },
    ]
  });
};
