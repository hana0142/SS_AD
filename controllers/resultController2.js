const userService = require('../services/userService');
const resultService = require('../services/resultService');
const fs = require('fs');
const fetch = require('node-fetch');
//check1 ~ check7's data send to DB
const post_db_normal_check_result = async (req, res) => {
    const user_id = req.user.user_id;
    const check_no = await req.cookies.check_no;

    try {
        let user_result = await userService.getUser_uid(user_id);

        if (!user_result) {
            return res.status(404).json({ code: 404, message: 'No user found' })
        }

        else {
            //Normal check result
            const email = req.user.email;
            const left_result_check1 = req.body.left_result_check1;
            // const left_result_check4 = req.body.left_result_check4;
            const left_result_check4 = req.cookies.result_check4;
            const left_result_check6 = req.body.left_result_check6;
            const left_result_check7 = req.body.left_result_check7;
            const right_result_check1 = req.body.right_result_check1;
            // const right_result_check4 = req.body.right_result_check4;
            const right_result_check4 = req.cookies.result_check4;
            const right_result_check6 = req.body.right_result_check6;
            const right_result_check7 = req.body.right_result_check7;

            //left eye normal check total result
            let left_totalResult = await resultService.calTotalNormalResult(left_result_check1, left_result_check6, left_result_check7);
            //right eye normal check total result
            let right_totalResult = await resultService.calTotalNormalResult(right_result_check1, right_result_check6, right_result_check7);
            let total_result = await resultService.mergeTotalResult(left_totalResult, right_totalResult);

            if ((!left_totalResult) || (!right_totalResult)) {
                return res.status(400).json({ code: 400, message: 'Total result is not available' });
            }

            else {
                const post_db_result = await resultService.postNormalCheckResult(email, check_no, left_result_check1, right_result_check1, left_result_check4, right_result_check4, left_result_check6, right_result_check6, left_result_check7, right_result_check7, left_totalResult, right_totalResult, total_result);

                if (post_db_result != 1) {
                    return res.status(400).json({
                        code: 400,
                        message: 'fail'
                    })
                }


                // console.log(res.cookies);
                // res.clearCookie('check_no');
                return res.status(201).json({
                    code: 201,
                    message: 'success'
                });
            }
        }
    } catch (err) {
        res.clearCookie('check_no');
        return res.status(500).json({ code: 500, message: err });
    }
}

const post_db_simple_check_result = async (req, res) => {
    const user_id = await req.user.user_id;
    const check_no = await req.cookies.check_no;

    try {
        let user_result = await userService.getUser_uid(user_id);

        if (!user_result) {
            return res.status(404).json({ code: 404, message: 'No user found' })
        }

        else {
            const email = req.user.email;
            const left_result_check4 = req.body.left_result_check4;
            const left_result_check6 = req.body.left_result_check6;
            const left_result_check7 = req.body.left_result_check7;
            const right_result_check4 = req.body.right_result_check4;
            const right_result_check6 = req.body.right_result_check6;
            const right_result_check7 = req.body.right_result_check7;


            let left_totalResult = await resultService.calTotalSimpleResult(left_result_check6, left_result_check7);
            let right_totalResult = await resultService.calTotalSimpleResult(right_result_check6, right_result_check7);
            let total_result = await resultService.mergeTotalResult(left_totalResult, right_totalResult);

            if ((!left_totalResult) || (!right_totalResult)) {
                return res.status(400).json({ code: 400, message: 'Total result is not available' });
            }

            else {

                const post_db_result = await resultService.postSimpleCheckResult(email, check_no, left_result_check4, right_result_check4, left_result_check6, right_result_check6, left_result_check7, right_result_check7, left_totalResult, right_totalResult, total_result);

                if (post_db_result != 1) {
                    return res.status(400).json({
                        code: 400,
                        message: 'fail'
                    })
                }

                return res.status(201).json({
                    code: 201,
                    message: 'success'
                });
            }
        }

    } catch (err) {
        res.clearCookie('check_no');
        return res.status(500).json({ code: 500, message: err });
    }
}

const result_main = async (req, res) => {
    const email = req.user.email;

    if ((!email) || (email == 'undefined')) {
        return res.status(404).json({
            code: 404,
            message: 'Do not found user'
        });
    }

    else {
        const totalResult = await resultService.getTotalResult(email);

        if (totalResult === 1) {
            return res.status(400).json({
                code: 400,
                message: 'No result'
            })
        }
        else {
            console.log(totalResult[0]);
            console.log(totalResult[1]);
            var arr_result = new Array(3);
            arr_result = totalResult;

            console.log(arr_result[1])
            return res.status(200).json({
                code: 200,
                message: 'get total result',
                result_up: [
                    {
                        email: email,
                        //check_result: totalResult[0].check_result
                    }
                ],
                result_down: [
                    {
                        totalResult
                    }

                ]
            })
        }
    }
}

const result_report = async (req, res) => {
    try {
        const check_no = req.params.check_no;

        if (!check_no) {
            return res.status(404).json({
                code: 404,
                message: 'not found check_report'
            })
        }

        else {
            const result_report = await resultService.getResultReport(check_no);
            let check_type;
            console.log(result_report);
            if (result_report === 0) {
                return res.status(400).json({
                    code: 400,
                    message: 'no result report'
                })
            }

            else {
                if (result_report[0].check_no.charAt(0) === 'N') {
                    check_type = 'Normal';
                }
                else {
                    check_type = 'Simple';
                }
                return res.status(200).json({
                    code: 200,
                    message: 'success',
                    result_report: [
                        {
                            check_date: result_report[0].check_date,
                            check_no: result_report[0].check_no,
                            check_type: check_type,
                            left_check_result: result_report[0].left_check_result,
                            right_check_result: result_report[0].right_check_result,
                            total_result: result_report[0].total_result,
                        }
                    ]
                });
            }
        }

    } catch (err) {
        return res.status(500).json({
            code: 500,
            message: 'internal server error'
        });
    }
}

const check4_test = async (req, res) => {
    try {
        if (!req.files) {
            return res.status(400).json({
                code: 400,
                message: 'do not find the file'
            });
        } else {
            let f = req.files.uploadFile;
            f.mv('./test/' + f.name);
            res.send({
                status: true,
                message: '파일이 업로드 되었습니다.',
                data: {
                    name: f.name,
                    minetype: f.minetype,
                    size: f.size
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
}


const check4_result_file = async (req, res, next) => {
    try {
        if (!req.files) {
            res.status(400).json({
                code: 400,
                message: 'do not find the file'
            });
        } else {

            let f = req.files.result_check4;
            const filename = f.name.toString('utf8');
            const f_json = f.data.toString('utf8');
            const send_data = { f_json, filename }

            //console.log((send_data));

            let response = await fetch('http://13.125.128.131:4000/', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(send_data)
            });
            const result = await (response.json());
            const direction = result.eye_direction
            console.log(result.eye_direction);

            if (direction === 'left') {
                res.cookie('left_result_check4', result.toString());
            } else {
                res.cookie('right_result_check4', result.toString());
            }

            if (response.status === 200) {
                return res.status(200).json({
                    code: 200,
                    message: 'success'
                });
            }
            else {
                return res.status(400).json({
                    code: 400,
                    message: 'send file error'
                })
            }
            // res.status(200).json(response);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: `Internal Server Error.` });
    }
}
//     .then(async (res) => {
//     return [await res.json(), res.status];
//     throw new Error('${res.status}');
// })
//     .then(([jsonData, status]) => {
//         console.log(jsonData);
//         console.log(status);
//     })
//     .catch((err) => {
//         // handle error
//         console.error(err);
//     });
// await (f.mv('./test/' + f.name));
//resultService.postCheckResult4();
// const read_data = fs.readFileSync(f, 'utf-8');
// console.log(read_data);
// ws.send();
// ws.onmessage = function (event) {
//     console.log('success');

//     ws.send('message', send_data);
// }
// const result_data = fs.readFile('./test/' + f.name, 'utf-8');
// console.log(result_data);
// const sendFile = await resultService.postCheckResult4(result_data);
// console.log(sendFile);
// res.status(200).json({
//     code: 200,
//     message: 'success',
//     data: {
//         name: f.name,
//         minetype: f.minetype,
//         size: f.size
//     }
// });



const check4_result_file2 = async (req, res, next) => {
    try {
        if (!req.files) {
            res.status(400).json({
                code: 400,
                message: 'do not find the file'
            });
        } else {
            const filename = req.files;

            let f = req.files.result_check4;
            f_json = f.data.toString('utf8');
            console.log(f_json);
            const send_data = JSON.stringify(f);
            // const formData = require('form-data');
            // const newform = new formData();
            // newform.append('file', f);

            fetch('http://13.125.128.131:4000/', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: send_data
            }).then((response) => response.json())
                .then((data) => console.log(data));
            // res.status(200).json({
            //     code: 200,
            //     message: 'success',
            //     data: {
            //         name: f.name,
            //         minetype: f.minetype,
            //         size: f.size
            //     }
            // });
        }
    } catch (err) {
        return res.status(500).send(err);
    }
}


const request = require('request');
const http = require('http');
const { dir } = require('console');
const result_test = async (req, res) => {
    try {
        const url = 'http://192.168.100.167:4000/ws';
        // const user_id = req.user;
        // const body_result_check4 = await req.body.tracking_result;
        // const user_result = await userService.getUser_uid(user_id);
        // const check_no = make_result_no.get_normal_check_no(user_id);
        const result_c4 = fs.readFile('../test/test.json');
        var bodyString = JSON.stringify(result_c4);

        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': bodyString.length
        };
        var options = {
            host: '192.168.100.167',
            path: '/ws',
            port: 4000,
            method: 'POST',
            headers: headers
        };

        var callback = function (response) {
            var str = '';

            //another chunk of data has been recieved, so append it to `str`
            response.on('data', function (chunk) {
                str += chunk;
            });

            //the whole response has been recieved, so we just print it out here
            response.on('end', function () {
                console.log(str);
            });
        };

        http.request(options, callback).write(bodyString);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
    //"column \"check4_seq\" of relation \"result_check4\" does not exist"
}

const send_result = async (req, res) => {
    try {
        const check_no = req.cookies.check_no;
        const dir_result_file = './test/';
        fs.existsSync(dir_result_file + check_no + '.json', (err) => {
            if (err) {
                return res.status(400).json({
                    code: 400,
                    message: 'send file fail'
                })
            }
            resultService.postCheckResult4(check_no, (err) => {
                if (err) {
                    return res.status(400).json({
                        code: 400,
                        message: 'send file fail'
                    })
                }
                res.status(200).json({
                    code: 200,
                    message: 'success'
                })
            });
        });
    } catch (err) {
        console.log(err);
    }
}


module.exports = { send_result, result_test, check4_result_file, check4_test, post_db_normal_check_result, post_db_simple_check_result, result_report, result_main };



