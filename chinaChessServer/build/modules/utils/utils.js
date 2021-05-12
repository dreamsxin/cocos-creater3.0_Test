"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 随机生成pid
 */
function getRandPid() {
    return Math.floor(Math.random() * 100000);
}
exports.getRandPid = getRandPid;
