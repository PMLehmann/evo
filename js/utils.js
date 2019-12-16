function moveToPoint(xToGo, yToGo, xCurrent, yCurrent, speed) {
    var delta_x = xToGo - xCurrent;
    var delta_y = yToGo - yCurrent;
    var goal_dist = Math.sqrt((delta_x * delta_x) + (delta_y * delta_y))

    var ratio = speed / goal_dist;
    var x_move = ratio * delta_x;
    var y_move = ratio * delta_y;
    return [x_move, y_move];
}

function calcDistance(x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.sqrt(a * a + b * b);
}

function round(v) {
    return (v >= 0 || -1) * Math.round(Math.abs(v));
}

function roundDec(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function valBetween(v, min, max) {
    return (Math.min(max, Math.max(min, v)));
}