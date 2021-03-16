import { _decorator, Component, Node, GraphicsComponent, tween, Vec3, find, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {


    start() {
        let pos = this.node.getWorldPosition();
        this.scheduleOnce(() => {
            tween(this.node).to(4, { position: new Vec3(pos.x + 5, pos.y, pos.z - 10) }).start();
        }, 1);
        let v1 = new Vec3(1, -10, 10);
        let v2 = new Vec3(4, -5, -20);
        let out = v3();
        out = Vec3.min(out, v1, v2);
        console.log(out);

    }
}
