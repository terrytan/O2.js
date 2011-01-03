/**
 * @fileoverview O2.
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
KISSY.app('O2');
O2.MODS = [
    'skin',
    'canvas',
    'fps',
    'audio',
    'notes'
];

KISSY.each(O2.MODS, function(o) {
    O2.add(o, {
        fullpath: 'js/' + o + '.js'
    });
});

O2.add('keyboard', {
    fullpath: 'js/keyboard.js',
    requires: O2.MODS
});

O2.add('core', {
    fullpath: 'js/bms.js',
    requires: O2.MODS
});
O2.use('core');
