/**
 * 网格对象
 */
export default class pitem {
    public width: number = 1;
    public height: number = 1;
    public F: number = 0;
    public G: number = 0;
    public H: number = 0;
    /* 正向和斜向消耗 */
    public value_h: number = 10;
    public value_v: number = 14;
    /* 坐标 */
    public x: number = 0;
    public z: number = 0;
    public parent: pitem = null;
}
