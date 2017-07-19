# Welsome to Greenseer Bot. A bot for Game of Thrones which helps you Breakdown episodes.

Here i will talk about all aspects of my Game Of Thrones Bot on https://www.facebook.com/gotoraven/

Back-end AWS EC2
Front-end FB Messenger

Overview

### bot.js
JS will interact with facebook graph API to handle request and response. It is designed to handle minimum load. It calls a Python file. This Python file writes a JSON file (output). JS just sends the entire JSON file as a response.

### parent.py  
Every request is passed on from bot.js to parent.py. Python does computation and writes request ready to be sent in JSON (gres.json). 
