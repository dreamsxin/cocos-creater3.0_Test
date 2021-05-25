/**
 * 随机生成pid
 */
export function getRandPid(): number {
    return Math.floor(Math.random() * 100000);
}