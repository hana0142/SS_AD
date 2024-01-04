const Check1Result = require('../models').result_check1;
const Check1_1Result = require('../models').result_check1_1;
const Check2Result = require('../models').result_check2;
const Check3Result = require('../models').result_check3;
const Check4Result = require('../models').result_check4;
const Check5Result = require('../models').result_check5;
const Check6Result = require('../models').result_check6;
const Check7Result = require('../models').result_check7;
const TotalResult = require('../models').check_result;
const User = require('../models').users;
const models = require('../models');
const resultGrade = require('./convertGrade');
const fs = require('fs');

exports.getResultReport = async (check_no) => {
    const result_report = await TotalResult.findAll({ where: { check_no } });
    console.log('before', result_report);
    let return_result = -1;

    if (!result_report) {
        console.log('exist', result_report);
        return_result = 1;
        return result_report;
    }
    else {
        console.log('not', result_report);
        return_result = 0;
        return result_report;
    }
}

exports.getTotalResult = async (email) => {
    let return_result = -1;
    let first_row, second_row, third_row = new Array(3);

    if (!email) {
        return_result = 1;
        return return_result;
    }

    else {
        const total_result = await TotalResult.findAll({
            where: { email },
            limit: 5,
            order: [['created_date', 'DESC']]
        });
        return total_result;
    }
}

// exports.postTotalResult = async (check_no, email, totalResult) => {
//     let return_data;
//     const create_date = Date.now();

//     try {
//         const data_total_result = await TotalResult.create({
//             email: email,
//             check_no: check_no,
//             check_result: totalResult,
//             check_left_eye: 145,
//             check_right_eye: 132,
//             check_date: create_date
//         });

//         await data_total_result.save();

//         return_data = 1;
//         return return_data;

//     } catch (err) {
//         return_data = 0;
//         console.log(err);
//         return return_data;
//     }

// }

//normal_check : left_total_result, right_total_result, merge_result


exports.getCheckResult1 = async (email) => {
    const user_result = await User.findAll({ where: { email } });

    if (!user_result) {
        return res.status(404).json({ message: 'No user found' })
    }
    else {
        return user_result;
    }
}

exports.getCheckResult4 = async (email) => {
    const user_result = await User.findAll({ where: { email } });

    if (!user_result) {
        return res.status(404).json({ message: 'No user found' })
    }
    else {
        return user_result;
    }
}

exports.getCheckResult6 = async (email) => {
    const user_result = await User.findAll({ where: { email } });

    if (!user_result) {
        return res.status(404).json({ message: 'No user found' })
    }
    else {
        return user_result;
    }
}

exports.getCheckResult7 = async (email) => {
    const user_result = await User.findAll({ where: { email } });

    if (!user_result) {
        return res.status(404).json({ message: 'No user found' })
    }
    else {
        return user_result;
    }
}

//Normal Check result
exports.calTotalNormalResult = async (result_check1, result_check1_1, result_check2, result_check3, result_check6, result_check7) => {
    let return_total_result = '';

    const grade_check1 = await resultGrade.convertCheck1(result_check1);
    const grade_check1_1 = await resultGrade.convertCheck1_1(result_check1_1);
    const grade_check2 = await resultGrade.convertCheck2(result_check2);
    const grade_check3 = await resultGrade.convertCheck3(result_check3);
    const grade_check6 = await resultGrade.convertCheck6(result_check6);
    const grade_check7 = await resultGrade.convertCheck7(result_check7);

    try {
        //check1's result convert
        if (grade_check1 === 'Bad') {
            return_total_result = 'Bad';
            return return_total_result;
        }

        //check1 is not 'Bad' => total_result
        if (grade_check1 != 'Bad') {
            if (grade_check1_1 == "Bad" || grade_check2 == "Bad" | grade_check6 == "Bad" || grade_check7 == "Bad") {
                return_total_result = "Bad";
                return return_total_result
            }
            else if (grade_check3 == "Not Bad" || grade_check6 == "Not Bad" || grade_check7 != "Not Bad") {
                return_total_result = "Not Bad_6";
                return return_total_result
            }
            else if (grade_check3 == "Not Bad" || grade_check6 != "Not Bad" || grade_check7 == "Not Bad") {
                return_total_result = "Not Bad_7";
                return return_total_result
            }
            else if (grade_check6 == "Not Bad" && grade_check7 == "Not Bad") {
                return_total_result = "Not Bad_7";
                return return_total_result
            }

            else if (grade_check3 == "Normal" || grade_check6 == "Normal" || grade_check7 != "Normal") {
                return_total_result = "Normal_6";
                return return_total_result
            }
            else if (grade_check3 == "Normal" || grade_check6 != "Normal" || grade_check7 == "Normal") {
                return_total_result = "Normal_7";
                return return_total_result
            }
            else if (grade_check6 == "Normal" && grade_check7 == "Normal") {
                return_total_result = "Normal_7";
                return return_total_result
            }

            else if (grade_check3 == "Good" || grade_check6 == "Good" || grade_check7 != "Good") {
                return_total_result = "Good_6";
                return return_total_result
            }
            else if (grade_check3 == "Good" || grade_check6 != "Good" || grade_check7 == "Good") {
                return_total_result = "Good_7";
                return return_total_result
            }
            else if (grade_check6 == "Good" && grade_check7 == "Good") {
                return_total_result = "Good_7";
                return return_total_result
            }

            else {
                return_total_result = "Excellent_7";
                return return_total_result;
            }
        }
    } catch (err) {
        return_total_result = 'error';
        return return_total_result;
    }
}

//total simple check result
exports.calTotalSimpleResult = async (result_check6, result_check7) => {
    let return_total_simple_result = '';

    const grade_check6 = await resultGrade.convertCheck6(result_check6);
    const grade_check7 = await resultGrade.convertCheck7(result_check7);

    try {
        if (grade_check6 == "Bad" || grade_check7 == "Bad") {
            return_total_simple_result = "Bad";
            return return_total_simple_result
        }
        else if (grade_check6 == "Not Bad" || grade_check7 != "Not Bad") {
            return_total_simple_result = "Not Bad_6";
            return return_total_simple_result
        }
        else if (grade_check6 != "Not Bad" || grade_check7 == "Not Bad") {
            return_total_simple_result = "Not Bad_7";
            return return_total_simple_result
        }
        else if (grade_check6 == "Not Bad" && grade_check7 == "Not Bad") {
            return_total_simple_result = "Not Bad_7";
            return return_total_simple_result
        }

        else if (grade_check6 == "Normal" || grade_check7 != "Normal") {
            return_total_simple_result = "Normal_6";
            return return_total_simple_result
        }
        else if (grade_check6 != "Normal" || grade_check7 == "Normal") {
            return_total_simple_result = "Normal_7";
            return return_total_simple_result
        }
        else if (grade_check6 == "Normal" && grade_check7 == "Normal") {
            return_total_simple_result = "Normal_7";
            return return_total_simple_result
        }

        else if (grade_check6 == "Good" || grade_check7 != "Good") {
            return_total_simple_result = "Good_6";
            return return_total_simple_result
        }
        else if (grade_check6 != "Good" || grade_check7 == "Good") {
            return_total_simple_result = "Good_7";
            return return_total_simple_result
        }
        else if (grade_check6 == "Good" && grade_check7 == "Good") {
            return_total_simple_result = "Good_7";
            return return_total_simple_result
        }

        else {
            return_total_simple_result = "Excellent_7";
            return return_total_simple_result;
        }

    } catch (err) {
        return_total_simple_result = 'error';
        return return_total_simple_result;
    }
}

exports.postNormalCheckResult =
    async (email, check_no, left_result_check1, right_result_check1,
        left_result_check1_1, right_result_check1_1, left_result_check2, right_result_check2,
        left_result_check3, right_result_check3,left_result_check4,right_result_check4,
        left_result_check5, right_result_check5,
        left_result_check6, right_result_check6, left_result_check7, right_result_check7,
        left_total_result, right_total_result, merge_result) => {

        const t = await models.sequelize.transaction();
        const create_date = Date.now();
        let return_result = -1;
        // const left_result_check4 = req.cookies.left_result_check4;
        // const right_result_check4 = req.cookies.right_result_check4;
        try {
            //create result_check1_row in db 
            const data_result_check1 = await Check1Result.create({
                check_no: check_no,
                email: email,
                left_result_check1: left_result_check1,
                right_result_check1: right_result_check1,
                check_date: create_date,
            }, { transaction: t });
            const data_result_check1_1 = await Check1_1Result.create({
                check_no: check_no,
                email: email,
                left_result_check1_1: left_result_check1_1,
                right_result_check1_1: right_result_check1_1,
                check_date: create_date,
            }, { transaction: t });

            const data_result_check2 = await Check2Result.create({
                check_no: check_no,
                email: email,
                left_result_check2: left_result_check2,
                right_result_check2: right_result_check2,
                check_date: create_date,
            }, { transaction: t });

            const data_result_check3 = await Check3Result.create({
                check_no: check_no,
                email: email,
                left_result_check3: left_result_check3,
                right_result_check3: right_result_check3,
                check_date: create_date,
            }, { transaction: t });

            const data_result_check4 = await Check4Result.create({
                check_no: check_no,
                email: email,
                left_result_check4: left_result_check4,
                right_result_check4: right_result_check4,
                check_date: create_date
            }, { transaction: t });

            const data_result_check5 = await Check5Result.create({
                check_no: check_no,
                email: email,
                left_result_check5: left_result_check5,
                right_result_check5: right_result_check5,
                check_date: create_date
            }, { transaction: t });

            const data_result_check6 = await Check6Result.create({
                check_no: check_no,
                email: email,
                left_result_check6: left_result_check6,
                right_result_check6: right_result_check6,
                check_date: create_date
            }, { transaction: t });

            const data_result_check7 = await Check7Result.create({
                check_no: check_no,
                email: email,
                left_result_check7: left_result_check7,
                right_result_check7: right_result_check7,
                check_date: create_date
            }, { transaction: t });

            const data_total_result = await TotalResult.create({
                email: email,
                check_no: check_no,
                left_check_result: left_total_result,
                right_check_result: right_total_result,
                total_result: merge_result,
                check_date: create_date
            }, { transaction: t });

            await t.commit();
            return_result = 1;
            return return_result;
        } catch (err) {
            console.log('error', err);
            return Error(err);
        }
    }

exports.postSimpleCheckResult = async (email, check_no, left_result_check4, right_result_check4, left_result_check6, right_result_check6, left_result_check7, right_result_check7, left_total_result, right_total_result, merge_result) => {
    const t = await models.sequelize.transaction();

    try {
        const create_date = Date.now();
        // console.log(check_no);
        //create result_check1_row in db 

        const data_result_check4 = await Check4Result.create({
            check_no: check_no,
            email: email,
            left_result_check4: left_result_check4,
            right_result_check4: right_result_check4,
            check_date: create_date
        }, { transaction: t });

        const data_result_check6 = await Check6Result.create({
            check_no: check_no,
            email: email,
            left_result_check6: left_result_check6,
            right_result_check6: right_result_check6,
            check_date: create_date
        }, { transaction: t });

        const data_result_check7 = await Check7Result.create({
            check_no: check_no,
            email: email,
            left_result_check7: left_result_check7,
            right_result_check7: right_result_check7,
            check_date: create_date
        }, { transaction: t });

        const data_total_result = await TotalResult.create({
            email: email,
            check_no: check_no,
            left_check_result: left_total_result,
            right_check_result: right_total_result,
            total_result: merge_result,
            check_date: create_date
        }, { transaction: t });

        await t.commit();
        return_data = 1;
        return return_data;
    } catch (err) {
        console.log('err', err);
        return Error(err);
    }
}

exports.mergeTotalResult = async (left_result, right_result) => {
    //bad, notbad, normal, good, excellent
    let return_merge_result = 'none';

    if ((!left_result) || (!right_result)) {
        return_merge_result = '';
    }

    else {
        if ((left_result == 'Bad') || (right_result == 'Bad')) {
            return_merge_result = 'Bad';
            return return_merge_result;
        }
        else if ((left_result == 'Not Bad_6') || (left_result == 'Not Bad_7') || (right_result == 'Not Bad_6') || (right_result == 'Not Bad_7')) {
            return_merge_result = 'Not Bad';
            return return_merge_result;
        }

        else if ((left_result == 'Normal_6') || (left_result == 'Normal_7') || (right_result == 'Normal_6') || (right_result == 'Normal_7')) {
            return_merge_result = 'Normal';
            return return_merge_result;
        }

        else if ((left_result == 'Good_6') || (left_result == 'Good_7') || (right_result == 'Good_6') || (right_result == 'Good_7')) {
            return_merge_result = 'Good';
            return return_merge_result;
        }

        else {
            return_merge_result = 'Excellent';
            return return_merge_result;
        }
    }
}

exports.postCheckResult4_cp = async (check_no) => {

    // const buffer1 = Buffer.from(data);

    const fdata = fs.readFileSync('/home/bitnami/service_server/test/test.json');

    var net = require('net'),
        JsonSocket = require('json-socket');

    var port = 4000; //The same port that the server is listening on
    var host = '13.125.128.131';
    var socket = new JsonSocket(new net.Socket()); //Decorate a standard net.Socket with JsonSocket
    socket.connect(port, host);
    socket.on('connect', function () { //Don't send until we're connected
        socket.sendMessage(JSON.stringify(fdata.toString()));
        socket.on('message', function (fdata) {
            //console.log(fdata);

        });
    });
}
exports.postCheckResult4 = async (f) => {

    console.log(f);
    // const buffer1 = Buffer.from(data);

    // const fdata = fs.readFileSync('/home/bitnami/service_server/test/test.json');

    var net = require('net'),
        JsonSocket = require('json-socket');

    var port = 4000; //The same port that the server is listening on
    var host = '13.125.128.131';
    var socket = new JsonSocket(new net.Socket()); //Decorate a standard net.Socket with JsonSocket
    socket.connect(port, host);
    socket.on('connect', function () { //Don't send until we're connected
        socket.sendMessage(JSON.stringify(fdata.toString()));
        socket.on('message', function (fdata) {
            //console.log(fdata);

        });
    });
    // const reader = readline.createInterface({ input: process.stdin })
    // reader.on("line", (line) => {
    //     client.write(`${line}\n`)
    // })
    // reader.on("close", () => {
    //     client.end()
    // })
}
