
import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UiBase')
export class UiBase extends Component {
    protected closeAction(cb?: Function) {
        let animTime = 0.3;
        tween(this.node).to(animTime, { scale: new Vec3() }, { easing: 'backIn' }).call(() => {
            if (cb) cb();
        }).start();
    }

    protected openAnim(cb?: Function) {
        this.node.active = true;

        let animTime = 0.3;
        this.node.scale = new Vec3();
        tween(this.node).to(animTime, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }).call(() => {
            if (cb) cb();
        }).start();
    }
}
