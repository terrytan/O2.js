/**
 * @fileoverview O2 KeyBoard.
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
O2.add('keyboard', function() {
    var S = KISSY, E = S.Event;
    var color = O2.Skin.color,
        channels = O2.channels;

    var drawLine = O2.Canvas.drawLine,
        drawRect = O2.Canvas.drawRect,
        drawGradient = O2.Canvas.drawGradient;

    // background layer, effects layer
    var ec = O2.Music.config.effectContainer, ectx = ec.getContext('2d'),
        bc = O2.Music.config.backgroundContainer, bctx = bc.getContext('2d');
        nl = ec.width, eh = ec.height, p = nl / 7;

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

    var audio = ['0A', '0B', '0C', '0D', '0E', '0F', '0G'],
        play = function(a) {
            //O2.Audio[a].pause();
            O2.Audio[a].currentTime = 0;
            O2.Audio[a].play();
        };
    E.on(document, 'keydown', function(e) {
        var i = keys.indexOf(e.keyCode);
        if (i !== -1) {
            play(audio[i]);
            if (keyMap[i].keyDown) return;
            var s = channels[i];
            ectx.fillStyle = drawGradient(ectx,
                {0: 'rgba(255, 255, 255, 0)', 1: keyMap[i].color},
                s, 0, s, eh);
            drawRect(ectx, ectx.fillStyle, s, 0, p, eh);
            keyMap[i].keyDown = true;
        }
    });
    E.on(document, 'keyup', function(e) {
        var i = keys.indexOf(e.keyCode);
        if (i !== -1) {
            var s = channels[i];
            ectx.clearRect(s, 0, p, eh);
            keyMap[i].keyDown = false;
        }
    });
});
