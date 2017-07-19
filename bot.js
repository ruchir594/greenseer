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
        const sender = event.sender.id;

        if (event.postback) {
            const text = JSON.stringify(event.postback).substring(0, 200);
            sendTextMessage(sender, 'Postback received: ' + text);
        } else if (event.message && event.message.text) { // bracket 101 open
            const text = event.message.text.trim().substring(0, 200);

            /////////////////////////////////////////////////////////////////////////////////////////

                    console.log("Receive a message2: " + text);

                    if(text == 'hi' || text == 'hey' || text == 'hello'){
                        //sendTextMessage(sender,"Hello, You can ask queries like \n1.What is sigil and words of House Arryn? \n2. What did arya do in season 3  \n3. Tell me something about Yunkai \n4. I want to know about House Casterly \n5. random house \n6. random city \n7. random character \n8. Is Eddard Stark dead?");
                        defaultQuickReplies(sender, "Hello, You can ask queries like \n1.What is sigil and words of House Arryn? \n2. What did arya do in season 3  \n3. Tell me something about Yunkai \n4. I want to know about House Casterly \n5. random house \n6. random city \n7. random character \n8. Is Eddard Stark dead?");
                    } else {//bracket 102 open
                      var options = {
                        mode: 'text',
                        args: [text, sender]
                      };
                      // running Python File
                      PythonShell.run("./parent.py" , options,function (err, results) {
                        if (err) throw err;
                        console.log('back in app.js')
                        console.log(results)
                        // Opening gres.json for the output
                        var arrobj = require('./gres.json');
                        // Sending the entire JSON object 
                        sendMessage(sender, arrobj);
                      });
               }//bracket 102 close
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

function defaultQuickReplies (sender, text) {
    sendMessage(sender, {
        text: text+'\n\nOr, would you like to delve into theiroes.',
        quick_replies:[
            {
                content_type: 'text',
                title: 'S7 E1 Theories',
                payload: 'S7_E1_Theories'
            },
            {
                content_type: 'text',
                title: 'S7 E2 Theories',
                payload: 'S7_E2_Theories'
            },
            {
                content_type: 'text',
                title: 'S7 E3 Theories',
                payload: 'S7_E3_Theories'
            }
        ]
    })
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
