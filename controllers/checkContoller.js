const make_result_no = require('../services/makeResultNo');
const Questionnaire = require('../models').questionnaire;

//make simple_check number and save the check_no in cookies
const simple_check = async (req, res) => {
    const user_id = req.cookies.user.user_id;

    try {
        if (!user_id) {
            return res.status(404).json({
                code: 404,
                message: 'Do not found user'
            })
        }

        else {
            const check_no = await make_result_no.get_simple_check_no(user_id);
            await res.cookie("check_no", check_no, { httpOnly: true });
            return res.status(200).json({
                code: 200,
                message: 'success'

            });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            code: 500,
            message: 'internal server error'
        });
    }
}

//make normal check number and save the check_no in cookies
const normal_check = async (req, res) => {
    const user_id = req.cookies.user.user_id;

    try {
        const check_no = await make_result_no.get_normal_check_no(user_id);
        await res.cookie("check_no", check_no, { httpOnly: true });
        return res.status(200).json({
            code: 200,
            message: 'success'
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            code: 500,
            message: 'internal server error'
        });
    }
}

//questionnaire store in DB
const post_questionnaire = async (req, res) => {
    const user_id = req.cookies.user.user_id;

    try {
        //make questionnaire number
        const qt_no = await make_result_no.get_qt_no(user_id);
        const email = req.cookies.user.email;
        const { eye_desease, vision_correction_surgery, glaucoma_surgery, retina_surgery, cataract_surgery, non_surgery, unknown } = req.body;
        const newQuestionnaire = await Questionnaire.create({
            q_no: qt_no,
            email: email,
            eye_desease: eye_desease,
            vision_correction_surgery: vision_correction_surgery,
            glaucoma_surgery: glaucoma_surgery,
            retina_surgery: retina_surgery,
            cataract_surgery: cataract_surgery,
            non_surgery: non_surgery,
            unknown: unknown
        });

        await newQuestionnaire.save();

        return res.status(200).json({
            code: 200,
            message: 'success'
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            code: 400,
            message: 'fail'
        });
    }
}

module.exports = { simple_check, normal_check, post_questionnaire };