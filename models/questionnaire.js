const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('questionnaire', {
    q_no: {
      type: DataTypes.STRING(256),
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    eye_desease: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    vision_correction_surgery: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "false"
    },
    glaucoma_surgery: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "false"
    },
    retina_surgery: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "false"
    },
    cataract_surgery: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "false"
    },
    non_surgery: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    unknown: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    created_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('now')
    }
  }, {
    sequelize,
    tableName: 'questionnaire',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "questionnaire_pkey",
        unique: true,
        fields: [
          { name: "q_no" },
        ]
      },
    ]
  });
};
