'use strict';

// Getting started with Facebook Messaging Platform
// https://developers.facebook.com/docs/messenger-platform/quickstart

const express = require('express');
const request = require('superagent');
const bodyParser = require('body-parser');
const https = require('https');

var spawn = require("child_process").spawn;
var PythonShell = require('python-shell');

// Variables
//let pageToken = "";
let pageToken = <your_TOKEN>;
const verifyToken = <your_TOKEN>;
const privkey = "/etc/letsencrypt/live/"+<your_URL>+"/privkey.pem";
const cert = "/etc/letsencrypt/live/"+<your_URL>+"/cert.pem";
const chain = "/etc/letsencrypt/live/"+<your_URL>+"/chain.pem";

const app = express();
const fs = require('fs');

app.use(bodyParser.json());

app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === verifyToken) {
        return res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
});
app.post('/webhook', (req, res) => {
    const messagingEvents = req.body.entry[0].messaging;

    messagingEvents.forEach((event) => {
        console.log('~~~~~\n~~~~~');
        console.log(event);
        const sender = event.sender.id;

        if (event.postback) {
            const text = JSON.stringify(event.postback).substring(0, 200);
            sendTextMessage(sender, 'Postback received: ' + text);
            var one = 'one';
        } else if (event.message && event.message.is_echo){
            var one = 'one'
        }
        else if (event.message && event.message.text) { // bracket 101 open
            const text = event.message.text.trim().substring(0, 200);

            /////////////////////////////////////////////////////////////////////////////////////////
                    console.log("Receive a message2: " + text);
                    //bracket 102 open
                    // make variable to pass to Python
                      var options = {
                        mode: 'text',
                        args: [text, sender]
                      };
                      // Call Python for processing
                      PythonShell.run("./parent.py" , options,function (err, results) {
                        if (err) throw err;
                        //console.log('back in app.js')
                        console.log(results)
                        // Response from Python is stored in JSON file which is ready to be sent to Facebook Graph API
                        var arrobj = JSON.parse(require('fs').readFileSync('gres.json', 'utf8'));
                        // Send Text or Image without being concern about the content
                        sendMessage(sender, arrobj);
                      });
               //bracket 102 close
        } //bracket 101 close
    });
    res.sendStatus(200);
});

function sendMessage (sender, message) {
    request
        .post('https://graph.facebook.com/v2.6/me/messages')
        .query({access_token: pageToken})
        .send({
            recipient: {
                id: sender
            },
            message: message
        })
        .end((err, res) => {
            if (err) {
                console.log('Error sending message: ', err);
            } else if (res.body.error) {
                console.log('Error: ', res.body.error);
            }
        });
}

function sendTextMessage (sender, text) {
    sendMessage(sender, {
        text: text
    });
}


app.post('/token', (req, res) => {
    if (req.body.verifyToken === verifyToken) {
        pageToken = req.body.token;
        return res.sendStatus(200);
    }
    res.sendStatus(403);
});
app.get('/token', (req, res) => {
    if (req.body.verifyToken === verifyToken) {
        return res.send({token: pageToken});
    }
    res.sendStatus(403);
});

 https.createServer({
      key: fs.readFileSync(privkey),
      cert: fs.readFileSync(cert),
      ca: fs.readFileSync(chain)
    }, app).listen(3800, function () {
  console.log('App is running on port 3800');
});
