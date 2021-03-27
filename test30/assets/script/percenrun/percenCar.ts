

import { _decorator, Component, Node, Vec3, tween } from 'cc';
import EventManager from '../shooting/eventManager';
import PercenUtil, { RoadPoints } from './percenUtil';
const { ccclass, property } = _decorator;

@ccclass('PercenCar')
export class PercenCar extends Component {
    private _isMoving: boolean = false;

    private count: number = 0;
    update() {
        if (!this._isMoving) {
            let length = PercenUtil.Inst.getPoints().length;
            if (length > 5) {
                this._isMoving = true;
                this._startMoving(0);
            }
        }
    }
    /**
     * 小车开始移动
     * @param idx 
     */
    private _startMoving(idx: number) {
        let data: RoadPoints = PercenUtil.Inst.getPointByIdx(idx);
        if (!data) {
            this._startMoving(idx);
            return;
        }
        this.count++;
        //控制自动回收和生成路径
        if (this.count > 1 && idx > 4) {
            EventManager.Inst.dispatchEvent(EventManager.EVT_recycle);
            this.count = 0;
        }
        let nextPos = data.pos;
        let time: number = 0;
        if (idx > 0) {
            //根据速度公式计算,当前位置到下一个位置需要花费的时间
            let frontPos = PercenUtil.Inst.getPointByIdx(idx - 1).pos;
            let distance = Vec3.distance(frontPos, nextPos);
            let speed: number = 20;
            time = distance / speed;
        }
        tween(this.node).to(time, { worldPosition: data.pos, eulerAngles: data.euler }).call(() => {
            idx++;
            this._startMoving(idx);
        }).start();
    }
}

/*
according to the roadline create a roadPoint List:include({pos:Vec3,type:})
                                                                    type:0,1,2
*/