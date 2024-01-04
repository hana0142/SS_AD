const express = require('express');
const nodemailer = require('nodemailer');

const sendEmail = async (email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: 'Reset Password Link',
            html: '<p>You requested for reset password, kindly use this < a href="http://eyecare.idynamics.co.kr:4000/api/users/test/register/auth-mail/' + token + '" > link</a> to reset your password</p > '
        });

        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = sendEmail;


