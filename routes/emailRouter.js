var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
require('dotenv').config();
var transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
}));

// htttps://localhost:5000/emails/
router.post('/', (req, res) => {
    const email = req.body.email;
    const message = req.body.message;
    const subject = req.body.subject;
    console.log(req.body);
    if (!email || !message || !subject) {
        console.log("invalid body");
        res.status(400);
        res.send({"Message" : "Please fill email body"});
    } else {
        try {
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: subject,
                text: message
            };
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                    res.status(500);
                    res.send({"Message" : "Error sending email"});
                } else {
                    console.log('Email sent: ' + info.response);
                    res.send({"Message" : "Email sent"});
                }
            });
        } catch (err) {
            console.log(err);
        }
    }
});

module.exports = router;