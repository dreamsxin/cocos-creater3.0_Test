
import { _decorator, Component, Node, Vec3, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CarmeraMove')
export class CarmeraMove extends Component {

    @property([Node])
    pointArr: Node[] = [];

    private _posArr: Vec3[] = [];
    private _eulerArr: Vec3[] = [];
    start() {
        for (let i = 0; i < this.pointArr.length; i++) {
            this._posArr.push(this.pointArr[i].getWorldPosition());
            this._eulerArr.push(this.pointArr[i].eulerAngles);
        }
        this._startMove(0);
    }

    _startMove(idx: number) {
        if (idx >= this._posArr.length) idx = 0;
        let pos: Vec3 = this._posArr[idx];
        let euler: Vec3 = this._eulerArr[idx];
        let time = 10;
        tween(this.node).to(time, { worldPosition: pos }).call(() => {
            idx++;
            this._startMove(idx);
        }).start();
        tween(this.node).to(time, { eulerAngles: euler }).start();
    }

    update() {
        // let euler = this.node.eulerAngles;
        // euler.subtract(new Vec3(0.1, 0, 0));
        // this.node.eulerAngles = euler;
    }

}

