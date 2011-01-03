/**
 * @fileoverview O2 Skins.
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
O2.add('skin', function() {
    var color = {
        blue: '#009999',
        red: '#ff0000',
        white: '#ffffff',
        green: '#00cc00',
        black: '#000000',
        orange: '#ff7400'
    };
    var notesColor = [color.white, color.blue, color.white, color.orange, color.white, color.blue, color.white];

    O2.Skin = {
        color: color,
        notesColor: notesColor
    };
});
