import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass
export default class pmain extends Component {

    @property(Node)
    role: Node = null;

    @property(Node)
    distination: Node = null;

    private wid: number = 50;
    onLoad() {
        // let v2 = new cc.Vec2(this.wid * 3, this.wid * 5);
        // this.role.setPosition(v2);
        // let v22 = new cc.Vec2(this.wid * 16, this.wid * 5);
        // this.distination.setPosition(v22);
    }

    start() {
    }
}
