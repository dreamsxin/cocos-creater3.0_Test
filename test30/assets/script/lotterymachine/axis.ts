
import { _decorator, Component, Node, Vec3 } from 'cc';
import EventManager from '../shooting/eventManager';
const { ccclass, property } = _decorator;
/* 轴心,旋转 */
@ccclass('Axis')
export class Axis extends Component {
    private angleZ: number = 0;
    private count: number = 0;
    private gap: number = 0;

    startGame() {
        this.count = 0;
        this.gap = 10;
        this.angleZ = 0;
    }


    update() {
        if (this.gap <= 0) return;
        this.count++;
        if (this.count % 60 == 0) {
            this.gap--;
            if (this.gap <= 0) {
                EventManager.Inst.dispatchEvent(EventManager.EVT_openDoor);
            }
        }
        this.angleZ += this.gap;
        let euler: Vec3 = new Vec3(0, 0, this.angleZ);
        this.node.eulerAngles = euler;
    }
}

