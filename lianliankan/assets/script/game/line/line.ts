
import { _decorator, Component, Node } from 'cc';
import { PoolManager } from '../../framework/poolManager';
const { ccclass, property } = _decorator;



@ccclass('Line')
export class Line extends Component {
    start() {
        this.scheduleOnce(() => {
            PoolManager.setNode(this.node);
        }, 0.5);
    }

}
