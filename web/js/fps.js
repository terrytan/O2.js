/**
 * @fileoverview O2 FPS.
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
O2.add('fps', function(O2, undefined) {
    var lastTime = +new Date,
        frameCount = 0,
        nowTime = +new Date,
        diffTime = Math.ceil(nowTime - lastTime),
        fps = 0;

    O2.FPS = {
        init: function() {
            nowTime = +new Date;
            diffTime = Math.ceil(nowTime - lastTime);
            if (diffTime > 1000) {
                fps = frameCount;
                frameCount = 0;
                lastTime = nowTime;
            }
            frameCount++;
        },
        log: function(container) {
            var fpsContainer = KISSY.one(container);
            setInterval(function() {
                fpsContainer.html('FPS: ' + fps);
            }, 1000);
        }
    };
});
