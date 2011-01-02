/**
 * @fileoverview O2 Notes.
 * @author yyfrankyy<yyfrankyy@gmail.com>
 *
 * @license
 *            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 *                    Version 2, December 2004.
 *
 * Copyright (C) 2004 Sam Hocevar
 *  14 rue de Plaisance, 75014 Paris, France
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 *
 *            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 *   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
 *
 *  0. You just DO WHAT THE FUCK YOU WANT TO.
 */
O2.add('notes', function(O2, undefined) {
    var S = KISSY, E = S.Event;

    var defaultConfig = {
        lengthPerQuaers: 500,
        height: 10
    };

    var color = {
        blue: '#009999',
        red: '#ff0000',
        white: '#ffffff',
        green: '#00cc00',
        orange: '#ff7400'
    };

    // draw a line, rect, gradient {{{
    var drawLine = function(context, color, start, end, width) {
        context.strokeStyle = color;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(start.x, end.y);
        context.stroke();
    };

    var drawRect = function(context, color, x, y, width, height) {
        context.fillStyle = color;
        context.fillRect(x, y, width, height);
    };

    var drawGradient = function(context, colors, sx, sy, dx, dy) {
        var gradient = context.createLinearGradient(sx, sy, dx, dy);
        for (var i in colors) {
            gradient.addColorStop(i, colors[i]);
        }
        return gradient;
    };
    // }}}

    var Notes = function(o, config) {
        var self = this;
        S.mix(self, o);
        self.config = S.mix(defaultConfig, config);

        // notes, effects
        var nc = self.config.notesContainer, ec = self.config.effectContainer;
        var nctx = nc.getContext('2d'), ectx = ec.getContext('2d');
        var nl = nc.width, h = nc.height, p = nl / 7;

        var channels = [], notes = {}, i = 0, j = 0, k = 0, s = 0;

        // redraw notes
        var redraw = function() {
            nctx.clearRect(0, 0, nl, h);

            // init all notes data
            localStorage.setItem('quaer', window.location.hash.replace(/^#/, '') || '001');
            var sample = localStorage.getItem('quaer');
            for (i = 0, l = O2.BMS.keys.length; i < l; i++) {
                for (k in self.body[sample]) {
                    var _i = parseInt(k),
                        _index = O2.BMS.keys.indexOf(_i);
                    if (_index === i) {
                        notes[i + ''] = self.body[sample][k];
                    }
                }
            }

            // draw split line, maybe this can be draw at a single canvas
            j = 0; s = 0;
            while (s < nl) {
                channels.push(s);
                drawLine(nctx, '#ffffff', {x: s, y: 0}, {x: s, y: h}, 1);
                s += p; j++;
            }

            var _color = [color.white, color.blue, color.white, color.orange, color.white, color.blue, color.white];
            // draw notes
            for (i in notes) {
                for (j in notes[i]) {
                    // 00 means nothing……
                    if (notes[i][j] === '00') continue;
                    drawRect(
                        nctx,
                        _color[+i],
                        channels[+i],
                        (1 - j) * self.config.lengthPerQuaers - self.config.height,
                        p,
                        self.config.height
                    );
                }
            }

            // auto update hash
            var currentIndex = +(window.location.hash.replace(/^#/, '') || 0);
            var autoplay = S.later(function() {
                //window.location.hash = '#' + padding(++currentIndex, 3);
            }, 1000);
        };

        // padding numbers 9999 10 0000009999
        var padding = function(num, len, markup) {
            len = Math.pow(10, len - 1); markup = markup || 0;
            if (num < len) {
                var l = len.toString().length - num.toString().length, za = [];
                while (za.length < l) {
                    za[za.length] = markup;
                }
                return za.join('') + num;
            }
            return num;
        };

        redraw();
        E.on(window, 'hashchange', redraw);

        // s,d,f,space,j,k,l
        var keys = [83, 68, 70, 32, 74, 75, 76],
            keyMap = [
                {which: 83, color: color.blue, keyDown: false},
                {which: 68, color: color.green, keyDown: false},
                {which: 70, color: color.blue, keyDown: false},
                {which: 32, color: color.red, keyDown: false},
                {which: 74, color: color.blue, keyDown: false},
                {which: 75, color: color.green, keyDown: false},
                {which: 76, color: color.blue, keyDown: false}
            ];
        E.on(document, 'keydown', function(e) {
            var i = keys.indexOf(e.keyCode);
            if (i !== -1) {
                if (keyMap[i].keyDown) return;
                var s = channels[i];
                ectx.fillStyle = drawGradient(ectx,
                    {0: 'rgba(255, 255, 255, 0)', 1: keyMap[i].color},
                    s, 0, s, h);
                drawRect(ectx, ectx.fillStyle, s, 0, p, h);
                keyMap[i].keyDown = true;
            }
        });

        E.on(document, 'keyup', function(e) {
            var i = keys.indexOf(e.keyCode);
            if (i !== -1) {
                var s = channels[i];
                ectx.clearRect(s, 0, p, h);
                keyMap[i].keyDown = false;
            }
        });

        var mc = S.get('#meta');
        S.one(S.DOM.create('<dt>标题</dt><dd>' + self.header['TITLE'] + '</dd>')).appendTo(mc);
        S.one(S.DOM.create('<dt>作者</dt><dd>' + self.header['ARTIST'] + '</dd>')).appendTo(mc);
        S.one(S.DOM.create('<dt>曲风</dt><dd>' + self.header['GENRE'] + '</dd>')).appendTo(mc);
        S.one(S.DOM.create('<dt>难度</dt><dd>' + O2.BMS.level[self.header['RANK']] + '</dd>')).appendTo(mc);
        S.one(S.DOM.create('<dt>等级</dt><dd>' + O2.BMS.level[self.header['PLAYLEVEL']] + '</dd>')).appendTo(mc);
    };

    S.ready(function() {
        S.IO.get('../data/canon/canon.json', function(o) {
            var notes = new Notes(S.JSON.parse(o), {notesContainer: S.get('#notes-canvas-notes'), effectContainer: S.get('#notes-canvas')});
            O2.Music = notes;
        });
    });
});
