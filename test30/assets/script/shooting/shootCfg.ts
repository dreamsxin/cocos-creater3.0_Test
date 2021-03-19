
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ShootCfg')
export class ShootCfg {
    public static speed: number = 0.3;
    public static movePause: boolean = false;
}
