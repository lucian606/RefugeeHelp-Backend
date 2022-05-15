var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
require('dotenv').config();

const pino = require('pino');
const pretty = require('pino-pretty');
const pinoLoki = require('pino-loki');

const options = {
    hostname: 'http://loki:3100',
    applicationTag: 'backend',
    timeout:3000,
    silenceErrors:false 
}

const streams = [
    { level: 'info', stream: pretty() },
    { level: 'info', stream: pinoLoki.createWriteStreamSync(options) },
];

let logger = pino({level:'info'}, pino.multistream(streams));

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
            logger.info({tags: {collection:"emails",operation:"post",status:"success"}});
        } catch (err) {
            console.log(err);
            logger.info({tags: {collection:"points",operation:"post",status:"error"}});
        }
    }
});

module.exports = router;