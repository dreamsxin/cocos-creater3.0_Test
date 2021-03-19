
import { _decorator, Component, Node, Prefab, Vec3 } from 'cc';
import { PoolManager } from '../infinitymap/poolManager';
const { ccclass, property } = _decorator;

@ccclass('NormalRoad')
export class NormalRoad extends Component {
    @property(Node)
    tree: Node = null as unknown as Node;
    onEnable() {
        // let rand = Math.random();
        // if (rand > 0.45) {
        //     this.tree.setPosition(new Vec3(-1.7, 0, 0));
        // }
        // else {
        //     this.tree.setPosition(new Vec3(1.7, 0, 0));
        // }
    }
}
