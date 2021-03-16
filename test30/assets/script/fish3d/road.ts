
import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Road')
export class Road extends Component {
    @property({ type: Number })
    isXZ: Number = 1;
    private _roadArr: Vec3[] = [];
    public getRoadLines(): Vec3[] {
        for (let i = 0; i < this.node.children.length; i++) {
            let child: Node = this.node.getChildByName(`p${i}`);
            this._roadArr.push(child.getWorldPosition());
        }
        return this._roadArr;
    }

    getIsXz() {
        return this.isXZ;
    }
}
