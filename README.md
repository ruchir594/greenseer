# Welsome to Greenseer Bot. A bot for Game of Thrones which helps you Breakdown episodes.

Here i will talk about all aspects of my Game Of Thrones Bot on https://www.facebook.com/gotoraven/

Back-end AWS EC2
Front-end FB Messenger



Overview

## Control Files

### bot.js
JS will interact with Facebook Graph API to handle request and response. It is designed to handle minimum load. It calls a Python file every time it receives something. This Python file writes a JSON file (output). JS just sends the entire JSON file as a response to FB Graph.

### parent.py  
Every request is passed on from bot.js to parent.py. Python does computation and writes request ready to be sent in JSON (gres.json).

### Conversation.CSV
Pattern matching conversation happens.
Rules
1. CSV has 2 columns. First column defines pattern. Second Column defines possible response.
2. Pattern is specified between \* (asterisk)
3. Multiple patterns are separated by \_ (underscore)

Check out simple CSV file to understand rules. Advance section below has link to more elaborate discussion. 

## Advance

Read [Actions Architecture in NatOS] (https://github.com/ruchir594/NatOS/tree/master/ActionsA) to understand role of ActionsA in this repo.
