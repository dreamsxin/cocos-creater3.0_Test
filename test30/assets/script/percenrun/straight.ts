
import { _decorator, Component, Node, Vec3, Collider, ICollisionEvent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Straight')
export class Straight extends Component {
    @property(Node)
    p1: Node = null as unknown as Node;
    @property(Node)
    p2: Node = null as unknown as Node;

    getPos(): Vec3[] {
        let pos1: Vec3 = this.p1.getWorldPosition();
        let pos2: Vec3 = this.p1.getWorldPosition();
        return [pos1, pos2];
    }

}