
import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ChessTag')
export class ChessTag extends Component {
    init(z: number) {
        let tg: Node = this.node.getChildByName("Cocos") as Node;
        tg.eulerAngles = new Vec3(0, 180, 0);
        if (z > 4) {
            tg.eulerAngles = new Vec3(0, 0, 0);
        }
    }
}
