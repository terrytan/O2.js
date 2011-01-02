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
        lengthPerQuaers: 1000,
        speed: 2,
        height: 8
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
        context.lineTo(end.x, end.y);
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
        var nc = self.config.notesContainer, nctx = nc.getContext('2d'),
            ec = self.config.effectContainer, ectx = ec.getContext('2d'),
            bc = self.config.backgroundContainer, bctx = bc.getContext('2d');

        var nl = nc.width, h = nc.height, p = nl / 7;

        var channels = [], notes = {}, longNotes = {}, i = 0, j = 0, k = 0, s = 0;

        // draw split line, maybe this can be draw at a single canvas
        j = 0; s = 0;
        while (s < nl) {
            channels.push(s);
            drawLine(bctx, color.white, {x: s, y: 0}, {x: s, y: h}, 1);
            s += p; j++;
        }
        var offset = +(localStorage.getItem('offset'));

        localStorage.setItem('quaer', window.location.hash.replace(/^#/, '') || '001');

        for (var i in self.define.WAV) {
            O2.audio.add(i, '../data/canon/' + self.define.WAV[i]);
        }

        // redraw notes
        var redraw = function() {
            O2.FPS.init();

            nctx.clearRect(0, 0, nl, h);
            var start = 0, quaer = localStorage.getItem('quaer');
            // reset
            while (start < h + self.config.lengthPerQuaers) {
                var notes = {}, i = 0, j = 0, k = 0, s = 0;
                for (i = 0, l = O2.BMS.keys.length; i < l; i++) {
                    for (k in self.body[quaer]) {
                        if (O2.BMS.keys.indexOf(+k) === i) {
                            notes[i.toString()] = self.body[quaer][k];
                        }
                        if (O2.BMS.longKeys.indexOf(+k) === i) {
                            longNotes[i.toString()] = self.body[quaer][k];
                        }
                    }
                }

                // quaer self increasement
                quaer = padding(+quaer + 1, 3);

                // draw notes {{{
                var notesColor = [color.white, color.blue, color.white, color.orange, color.white, color.blue, color.white];
                drawLine(nctx, color.white, {x: 0, y: h - self.config.lengthPerQuaers - start}, {x: nc.width, y: h - self.config.lengthPerQuaers - start}, 1);

                // short notes
                for (i in notes) {
                    for (j in notes[i]) {
                        // 00 means nothing……
                        if (notes[i][j] === '00') continue;
                        drawRect(
                            nctx,
                            notesColor[+i],
                            channels[+i],
                            h - j * self.config.lengthPerQuaers - self.config.height - start + offset,
                            p,
                            self.config.height
                        );
                    }
                }

                // long notes
                //for (i in longNotes) {
                    //var start, end;
                    //for (j in longNotes[i]) {
                        //if (notes[i][j] === '00') continue;
                        //if (!start) {
                            //start = j;
                        //} else if (start && !end) {
                            //end = j;
                        //}
                        //if (start && end) {
                            //drawRect(
                                //nctx,
                                //notesColor[+i],
                                //channels[+i],
                                //h - j * self.config.lengthPerQuaers - self.config.height - start + offset,
                                //p,
                                //(end - start) * self.config.lengthPerQuaers
                            //);
                            //start = end = 0;
                        //}
                    //}
                //}
                // }}}

                start += self.config.lengthPerQuaers;
            }

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

        var quaerCount = 0;
        var autoplay = setInterval(function() {
            //if (!O2.play) return;
            offset += self.config.speed;
            if (offset % self.config.lengthPerQuaers === 0) {
                offset = 0;
                quaerCount++;
                localStorage.setItem('quaer', padding(quaerCount, 3));
            }
            redraw();
        }, self.config.lengthPerQuaers / (self.config.speed * 1000));

        // keyboard {{{
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
        // }}}
    };

    S.ready(function() {
        S.IO.get('../data/canon/canon.json', function(o) {
            if (localStorage.getItem('quaer') === undefined || localStorage.getItem('offset') === undefined) {
                // init all notes data
                localStorage.setItem('quaer', window.location.hash.replace(/^#/, '') || '001');
                localStorage.setItem('offset', 0);
            }
            var notes = new Notes(S.JSON.parse(o), {
                notesContainer: S.get('#notes-canvas-notes'),
                backgroundContainer: S.get('#notes-canvas-background'),
                effectContainer: S.get('#notes-canvas')
            });
            O2.Music = notes;

            var mc = S.get('#meta');
            S.one(S.DOM.create('<dt>标题</dt><dd>' + notes.header['TITLE'] + '</dd>')).appendTo(mc);
            S.one(S.DOM.create('<dt>作者</dt><dd>' + notes.header['ARTIST'] + '</dd>')).appendTo(mc);
            S.one(S.DOM.create('<dt>曲风</dt><dd>' + notes.header['GENRE'] + '</dd>')).appendTo(mc);
            S.one(S.DOM.create('<dt>难度</dt><dd>' + O2.BMS.level[notes.header['RANK']] + '</dd>')).appendTo(mc);
            S.one(S.DOM.create('<dt>等级</dt><dd>' + notes.header['PLAYLEVEL'] + '</dd>')).appendTo(mc);
        });
        O2.FPS.log('#notes .ft');
    });
});
