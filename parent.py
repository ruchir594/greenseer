import sys
import os.path
import re
import random
import pickle
from ActionsA.nlg import generate
import childone
import json
from childone import get_random

thispath = './'
thisbot = 'greenbot'

def build(ret):
    res = ret.split('<')
    gres = {}

    if ret.replace(' ','') == 'random':
        ret=get_random(random.choice(['houses.txt', 'castles.txt', 'characters.txt']))
        ret=ret[:635].replace('"','').replace("'","")

    if res[0] == 'gen_quick_replies':
        if res[1] != 'no_text_necessary':
            gres['text'] = res[1]
        else:
            gres['text'] = 'Valar Dohaeris'
        gres['quick_replies'] = []
        i=2
        while i<len(res):
            data = {
                "content_type": "text",
                "title": res[i],
                "payload": res[i] + ' ql'
            }
            gres['quick_replies'].append(data)
            i+=1

        ret = res[0] + '^' + res[1] + '^' + str(gres)
    elif res[0] == 'gen_image_reply':
        # for sending an image as attachment
        data = {
                "type":"image",
                "payload":{
                    "url":res[1]
                }
            }
        gres['attachment'] = data
    else:
        gres['text'] = ret
    with open('gres.json', 'w') as outfile:
        json.dump(gres, outfile)
    return ret

def p(each_ex, id):
    each_ex = each_ex.lower()

    # --- Using NLTK to generate chatbot instance

    if not os.path.isfile(thispath + thisbot):
        print 'building chatbot instance...'
        generate.build_lambda(thispath, thisbot)

    # --- Opening an existing chatbot instance, to reduce time

    f = open(thispath + thisbot, 'r')
    chatbot=pickle.load(f)

    # ---
    ret = chatbot.converse2(each_ex)
    ret = build(ret)

    ret=ret.encode('ascii', 'ignore')
    print ret


'''
 This file function get's callled when bot.js executes pythonshell statement
'''
p(str(sys.argv[1]), sys.argv[2])
