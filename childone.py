'''
    This is just a Header file for parent.py to use.
'''

import random, re
import requests, urllib2
from bs4 import BeautifulSoup

def scrap_wiki_doc(thing):
    words = thing.split(' ')
    tail = ''
    for each in words:
        tail = tail + each + '_'
    tail = tail[:-1]
    '''opener = urllib2.build_opener()
    opener.addheaders = [('User-agent', 'Mozilla/5.0')]
    url = 'http://gameofthrones.wikia.com/wiki/'+tail
    response = opener.open(url)
    page = response.read()
    soup = BeautifulSoup(page, "lxml")'''
    site= 'http://gameofthrones.wikia.com/wiki/'+tail
    hdr = {'User-Agent': 'Mozilla/5.0'}
    req = urllib2.Request(site,headers=hdr)
    page = urllib2.urlopen(req)
    soup = BeautifulSoup(page, "lxml")
    soup = soup.find(id="mw-content-text")
    text = soup.get_text()
    return text
    
def most_relevant_1(title):
    doc = scrap_wiki_doc(title)
    title = title.lower()
    sentences = doc.split('\n')
    vector = []
    for each in sentences:
        cnt = each.lower().count(title.split(' ')[0])
        vector.append(cnt)
    arr = []
    for i in range(len(vector)):
        if vector[i] > 1 and vector[i] < 8:
            arr.append(i)
    if arr == []:
        return None
    return re.sub(r'\[.+?\]', '', sentences[random.choice(arr)])

def open_txt_file(filename):
    try:
        with open('./entities/' + filename) as f:
            content = f.readlines()
    except Exception:
        try:
            with open('../entities/' + filename) as f:
                content = f.readlines()
        except Exception:
            return ['Exception Error: entity tag file not found']
    return content

def get_random(filename):
    f = open_txt_file(filename)
    rv = random.choice(f)
    title = rv[:-1]
    r =  most_relevant_1(title)
    while r == None:
        r = get_random(random.choice(['houses.txt', 'castles.txt', 'characters.txt']))
    return title + ' : ' + r
