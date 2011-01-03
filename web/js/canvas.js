/**
 * @fileoverview O2 Canvas.
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
O2.add('canvas', function() {
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

    O2.Canvas = {
        drawLine: drawLine,
        drawRect: drawRect,
        drawGradient: drawGradient
    };
});
