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
    var S = KISSY;

    var defaultConfig = {
        lengthPerQuaers: 100,
        height: 10,
    };

    var color = {
        blue: "#009999",
        red: "#ff0000",
        green: "#00cc00",
        orange: "#ff7400"
    };

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

    var Notes = function(o, config) {
        var self = this;
        S.mix(self, o);
        self.config = S.mix(defaultConfig, config);

        var nc = self.config.notesContainer, ec = self.config.effectContainer;
        var nctx = nc.getContext('2d'), ectx = ec.getContext('2d');
        var l = nc.width, h = nc.height, p = l/7, s = 0;

        var channels = [];
        while (s < l) {
            channels.push(s);
            drawLine(nctx, '#ffffff', {x: s, y: 0}, {x: s, y: h}, 1);
            drawRect(nctx, color.blue, s, Math.random() * 500, p, self.config.height);
            s += p;
        }

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
        KISSY.Event.on(document, 'keydown', function(e) {
            var i = keys.indexOf(e.keyCode);
            if (i !== -1) {
                if (keyMap[i].keyDown) return;
                var s = channels[i];
                ectx.fillStyle = drawGradient(ectx,
                    {0: 'rgba(255, 255, 255, 0)', 1: keyMap[i].color},
                    s, 0, s, h);
                drawRect(ectx, ectx.fillStyle, s, 0, p, h)
                keyMap[i].keyDown = true;
            }
        });

        KISSY.Event.on(document, 'keyup', function(e) {
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
    };

    S.ready(function() {
        S.IO.get('../data/moon_01.json', function(o) {
            var notes = new Notes(S.JSON.parse(o), {notesContainer: S.get('#notes-canvas-notes'), effectContainer: S.get('#notes-canvas')});
            O2.Music = notes;
        });
    });
});
