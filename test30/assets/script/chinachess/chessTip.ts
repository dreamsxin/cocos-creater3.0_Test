
import { _decorator, Component, Node, tween, Label, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ChessTip')
export class ChessTip extends Component {
    showInfo(info: string) {
        let lb: Label = this.node.getChildByName("lb")?.getComponent(Label) as Label;
        lb.string = info;
        this.node.setWorldScale(new Vec3());
        tween(this.node).to(0.2, { worldScale: new Vec3(1, 1, 1) }).call(() => {
            tween(this.node).delay(1).call(() => {
                tween(this.node).to(0.2, { worldScale: new Vec3() }).start();
            }).start();
        }).start();
    }
}