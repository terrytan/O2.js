/**
 * @fileoverview O2 Audio.
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
O2.add('audio', function() {
    var S = KISSY, D = S.DOM;
    O2.Audio = {
        add: function(m, path) {
            if (!O2.Audio[m]) {
                var audio = D.create('<audio></audio>');
                audio.preload = true;
                audio.src = escape(path);
                audio.volume = 1;
                S.one('#music').append(audio);
                O2.Audio[m] = audio;
            }
        },
        play: function(m) {
            O2.Audio[m].play();
        }
    };
});
