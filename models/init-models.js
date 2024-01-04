var DataTypes = require("sequelize").DataTypes;
var _SequelizeMeta = require("./SequelizeMeta");
var _check_result = require("./check_result");
var _eye_desease_code = require("./eye_desease_code");
var _questionnaire = require("./questionnaire");
var _result_check1 = require("./result_check1");
var _result_check1_1 = require("./result_check1_1");
var _result_check2 = require("./result_check2");
var _result_check3 = require("./result_check3");
var _result_check4 = require("./result_check4");
var _result_check5 = require("./result_check5");
var _result_check6 = require("./result_check6");
var _result_check7 = require("./result_check7");
var _users = require("./users");

function initModels(sequelize) {
  var SequelizeMeta = _SequelizeMeta(sequelize, DataTypes);
  var check_result = _check_result(sequelize, DataTypes);
  var eye_desease_code = _eye_desease_code(sequelize, DataTypes);
  var questionnaire = _questionnaire(sequelize, DataTypes);
  var result_check1 = _result_check1(sequelize, DataTypes);
  var result_check1_1 = _result_check1_1(sequelize, DataTypes);
  var result_check2 = _result_check2(sequelize, DataTypes);
  var result_check3 = _result_check3(sequelize, DataTypes);
  var result_check4 = _result_check4(sequelize, DataTypes);
  var result_check5 = _result_check5(sequelize, DataTypes);
  var result_check6 = _result_check6(sequelize, DataTypes);
  var result_check7 = _result_check7(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);


  return {
    SequelizeMeta,
    check_result,
    eye_desease_code,
    questionnaire,
    result_check1,
    result_check1_1,
    result_check2,
    result_check3,
    result_check4,
    result_check5,
    result_check6,
    result_check7,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
