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

    var Notes = function(o) {
        S.mix(this, o);
    };

    S.ready(function() {
        S.IO.get('../data/moon_01.json', function(o) {
            var notes = new Notes(S.JSON.parse(o));
        });
    });
});
