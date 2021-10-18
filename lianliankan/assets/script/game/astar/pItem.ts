/**
 * 网格对象
 */
export default class pitem {
    public width: number = 75;
    public height: number = 75;
    public F: number;
    public G: number;
    public H: number;
    /* 正向和斜向消耗 */
    public value_h: number = 10;
    public value_v: number = 14;
    /* 坐标 */
    public x: number;
    public y: number;
    public parent: pitem;
    public w: number = 2;
    public h: number = 2;
}