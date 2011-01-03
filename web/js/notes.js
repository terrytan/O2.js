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
    var S = KISSY, D = S.DOM, E = S.Event;

    // canvas has max height limited
    // IE9: 16384
    // chrome: 32767
    // FF4: 32766
    var MAX_HEIGHT = 8000;

    var defaultConfig = {
        lengthPerQuaers: 395,
        speed: 1,
        bpm: 130,
        autoplay: false,
        height: 8
    };

    var color = O2.Skin.color, notesColor = O2.Skin.notesColor;
    var drawLine = O2.Canvas.drawLine,
        drawRect = O2.Canvas.drawRect,
        drawGradient = O2.Canvas.drawGradient;

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

    // create a notes canvas
    var createCanvas = function(notesContainer, height, offset) {
        var canvas = D.create('<canvas class="notes-canvas" style="display: none;" width="280"></canvas>');
        canvas.height = height;
        canvas.style.bottom = offset + 'px';
        S.one(notesContainer).append(canvas);
        return canvas;
    };

    var Notes = function(o, config) {
        var self = this;
        S.mix(self, o);
        self.config = S.mix(defaultConfig, config);

        var allHeight = self.length * self.config.lengthPerQuaers * self.config.speed;

        var nctxes = [], m = 0, offsetCache = [];
        // notes
        while (allHeight > 0) {
            nctxes.push(createCanvas(self.config.notesContainer, allHeight > MAX_HEIGHT ? MAX_HEIGHT : allHeight, m).getContext('2d'));
            offsetCache.push(m);
            allHeight -= MAX_HEIGHT;
            m += MAX_HEIGHT;
        }

        // background layer, effects layer
        var ec = self.config.effectContainer, ectx = ec.getContext('2d'),
            bc = self.config.backgroundContainer, bctx = bc.getContext('2d');

        for (var n = 0, nxl = nctxes.length; n < nxl; n++) {
            var nctx = nctxes[n], nc = nctx.canvas;

            var nl = nc.width, h = nc.height, eh = ec.height, p = nl / 7;
            var channels = [], notes = {}, longNotes = {},
                offset = +(localStorage.getItem('offset')),
                i = 0, j = 0, k = 0, s = 0;

            localStorage.setItem('quaer', window.location.hash.replace(/^#/, '') || '001');

            while (s < nl) {
                channels.push(s);
                s += p; j++;
            }

            // add audio
            for (var i in self.define.WAV) {
                O2.Audio.add(i, '../data/canon/' + self.define.WAV[i]);
            }

            // draw notes
            var draw = function(start) {
                nctx.clearRect(0, 0, nl, h);

                start = start || 0;
                var quaer = localStorage.getItem('quaer');
                while (start < h + self.config.lengthPerQuaers * self.config.speed) {
                    var notes = {}, i = 0, j = 0, k = 0, s = 0;
                    for (i = 0, l = O2.BMS.keys.length; i < l; i++) {
                        for (k in self.body[quaer]) {
                            // short notes collection
                            if (O2.BMS.keys.indexOf(+k) === i) {
                                notes[i.toString()] = self.body[quaer][k];
                            }
                            // long notes collection
                            if (O2.BMS.longKeys.indexOf(+k) === i) {
                                longNotes[i.toString()] = self.body[quaer][k];
                            }
                        }
                    }

                    // quaer self increasement
                    quaer = padding(+quaer + 1, 3);

                    // draw quaer split line
                    drawLine(
                        nctx,
                        color.white,
                        {x: 0, y: h - self.config.lengthPerQuaers - start},
                        {x: nc.width, y: h - self.config.lengthPerQuaers - start},
                        1
                    );

                    // short notes
                    for (i in notes) {
                        for (j in notes[i]) {
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

                    start += self.config.lengthPerQuaers * self.config.speed;
                }
            };

            draw();

        }

        // TODO make this out
        O2.channels = channels;

        // draw hori split
        for (var i = 0, l = channels.length; i < l; i++) {
            drawLine(bctx, color.white, {x: channels[i], y: 0}, {x: channels[i], y: h}, 1);
        }

        // show current viewport canvas
        var left, right;
        var viewportCanvas = function(offset) {
            var _left, _right;
            for (var i = 0, l = offsetCache.length; i < l; i++) {
                if (offset > offsetCache[i]) {
                    _left = i;
                } else {
                    _right = i;
                    break;
                }
            }
            if (left !== _left || right !== _right) {
                left = _left;
                right = _right;
                for (var i = 0, l = nctxes.length; i < l; i++) {
                    nctxes[i].canvas.style.display = 'none';
                }
                nctxes[left].canvas.style.display = 'block';
                nctxes[right].canvas.style.display = 'block';
            }
        };

        var quaerCount = 0,
            bottom = [];
        for (var i = 0, l = nctxes.length; i < l; i++) {
            bottom.push(parseInt(nctxes[i].canvas.style.bottom.replace('px$', '')));
        }

        setInterval(function() {
            //if (!self.config.autoplay) return;
            O2.FPS.init();
            offset += self.config.speed * self.config.lengthPerQuaers * parseInt(self.header.BPM) / (60 * 1000);
            for (var i = 0, nxl = nctxes.length; i < nxl; i++) {
                nctxes[i].canvas.style.bottom = bottom[i] - offset + 'px';
            }
            viewportCanvas(offset);
        }, 1);

    };

    S.ready(function() {
        S.IO.get('../data/canon/canon.json?' + +new Date, function(o) {
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
            O2.play = function() {
                O2.Music.config.autoplay = true;
            };

            O2.use('keyboard');

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
