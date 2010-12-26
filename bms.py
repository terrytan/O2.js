#!/usr/bin/python
# vim: fileencoding=utf-8:
import os,re,json

class BMS():
    """BMS Object"""
    def __init__(self, header = {
            # 1: SINGLE PLAYER; 3: DOUBLE PLAYER
            'PLAYER': '1',
            'GENRE': '',
            'TITLE': '',
            'ARTIST': '',
            # TAP PER MINUTES'
            'BPM': '130',
            'PLAYLEVEL': '1',
            # 0: VERY HARD; 1: HARD; 2: NORMAL; 3: EASY
            'RANK': '3',
            # ALL COOL COMBO SCORE'
            'TOTAL': '0',
            # MUSIC COVER'
            'STAGEFILE': '',
            # LONG
            'LNTYPE': '1',
            'LNOBJ': '',
            # 1: BEGINNER; 2: NORMAL; 3: HYPER; 4: ANOTHER; 5: INSANE
            'DIFFICULTY': '1',
            'SUBTITLE': ''
        }, define = {
            # KEY MUSIC'
            'WAV': {},
            # BACKGROUND PICTURES/VIDEO'
            'BMP': {},
            # CHANGE MUSIC SPEED'
            'BPM': {}
        }, body = {}):

        self.header = header
        self.define = define
        self.body = body
        self.re_cache = {}

        for i in self.header:
            self.re_cache[i] = re.compile('^#' + i + ' (.*)', re.IGNORECASE)
        for i in self.define:
            self.re_cache[i] = re.compile('^#' + i + '([0-9A-Z]{2}) (.*)', re.IGNORECASE)
        self.re_cache['BODY'] = re.compile('^#([0-9]{3})([0-9A-Z]{2}):([0-9A-Z]*)', re.IGNORECASE)
    
    def __getitem__(self, key):
        """get header"""
        return self.header[key]
    def __setitem__(self, key, item):
        """set header"""
        self.header[key] = item

    def parser_header(self, line):
        """parse bms header"""
        for i in self.header:
            g = self.re_cache[i].match(line)
            if g:
                self[i] = g.group(1).strip()
        for i in self.define:
            g = self.re_cache[i].match(line)
            if g:
                self.define[i][g.group(1)] = g.group(2)

    def parser_body(self, line):
        """parse bms body"""
        g = self.re_cache['BODY'].match(line)
        if g:
            if g.group(1) not in self.body:
                self.body[g.group(1)] = {}
            self.body[g.group(1)][g.group(2)] = self.parser_message(g.group(3))

    def parser_message(self, message, start = 0, per = 2):
        """parse main music data to offset data"""
        message_list, map_list = [], {}
        while start < len(message):
            message_list.append(message[start : start + per])
            start += per
        for i in message_list:
            # notice that parser did not filte any thing, even we already known that '00' meant nothing.
            map_list[i] = float(message_list.index(i)) / float(len(message_list))
        return map_list


def bms_parser(bms_file):
    """parse a bms file to a BMS instance"""
    header = body = False
    bms_header_markup = re.compile('^\*---------------------- HEADER FIELD')
    bms_body_markup = re.compile('\*---------------------- MAIN DATA FIELD')

    bms = BMS()
    re_cache = {}

    for line in open(bms_file).readlines():
        if bms_header_markup.match(line):
            header = True
            body = False
        if bms_body_markup.match(line):
            header = False
            body = True
        if header:
            bms.parser_header(line)
        elif body:
            bms.parser_body(line)

    print bms.body
    for i in bms.body:
        print '|--session start----'
        for j in bms.body[i]:
            print '|--|--track start----'
            for k in bms.body[i][j]:
                if k in bms.define['WAV']:
                    print '|--|--|--' + bms.define['WAV'][k] + '----'
                    pass
                else:
                    print '|--|--|--NOTHING HERE----'
                    pass

bms_parser('moon_01.bms')
