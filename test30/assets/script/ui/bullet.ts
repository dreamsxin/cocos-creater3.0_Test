import { _decorator, Component, Node, Vec3, RigidBody } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    private _speed: number = 3000;
    start() {
        this.scheduleOnce(() => {
            this.node.destroy();
        }, 3);
    }
    shoot(radian: number) {
        let force: Vec3 = new Vec3(-Math.cos(radian) * this._speed, 100, Math.sin(radian) * this._speed);
        this.node.getComponent(RigidBody)?.applyForce(force);
    }
}
