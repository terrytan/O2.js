/**
 * @fileoverview O2 BMS.
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
O2.add('bms', function() {
    O2.BMS = {
        //keys: [11, 12, 13, 14, 15, 18, 19],
        //文档上说的是上面这个，但是BMSE和O2解析出来的是下面这种
        keys: [16, 11, 12, 13, 14, 15, 18],
        longKeys: [56, 55, 52, 53, 54, 55, 58],
        level: ['非常困难', '困难', '中等', '简单']
    };
});
