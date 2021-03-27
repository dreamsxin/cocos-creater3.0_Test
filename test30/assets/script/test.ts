import { _decorator, Component, Node, GraphicsComponent, tween, Vec3, find, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {
    @property(Node)
    center: Node = null as unknown as Node;

    private _worldPos: Vec3 = new Vec3();
    private _centerPos: Vec3 = new Vec3();
    onEnable() {
        this._worldPos = this.node.getWorldPosition();
        this._centerPos = this.center.getWorldPosition();
    }
    start() {
        // let pos = this.node.getWorldPosition();
        // this.scheduleOnce(() => {
        //     tween(this.node).to(4, { position: new Vec3(pos.x + 5, pos.y, pos.z - 10) }).start();
        // }, 1);
        // let v1 = new Vec3(1, -10, 10);
        // let v2 = new Vec3(4, -5, -20);
        // let out = v3();
        // out = Vec3.min(out, v1, v2);

        this.scheduleOnce(() => {
            this.isStart = true;
        }, 1);
    }
    private isStart: boolean = false;

    update() {
        if (!this.isStart) return;
        this._rotateAroudY();
    }

    /**
     * 绕旋转中心Y轴旋转
     */
    _rotateAroudY() {
        let radian = Math.atan2(this.node.worldPosition.z - this._centerPos.z, this.node.worldPosition.x - this._centerPos.x);
        let angle = 90 - radian * 180 / Math.PI;
        this.node.eulerAngles = new Vec3(0, angle, 0);
        Vec3.rotateY(this._worldPos, this._worldPos, this._centerPos, -0.02);
        this.node.setWorldPosition(this._worldPos);
    }
}
