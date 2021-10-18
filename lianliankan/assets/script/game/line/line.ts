
import { _decorator, Component, Node } from 'cc';
import { PoolManager } from '../../framework/poolManager';
const { ccclass, property } = _decorator;



@ccclass('Line')
export class Line extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    start() {
        this.scheduleOnce(() => {
            PoolManager.setNode(this.node);
        }, 2);
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}
