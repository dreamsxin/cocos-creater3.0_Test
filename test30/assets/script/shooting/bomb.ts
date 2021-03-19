
import { _decorator, Component, Node, Vec3, RigidBody } from 'cc';
import { PoolManager } from '../infinitymap/poolManager';
const { ccclass, property } = _decorator;

@ccclass('Bomb')
export class Bomb extends Component {
    private _speed: number = 2500;
    shoot(pos: Vec3) {
        this.node.setWorldPosition(pos);
        let force: Vec3 = new Vec3(0, 0, -this._speed - Math.random() * 400);
        this.node.getComponent(RigidBody)?.applyForce(force);
        this.scheduleOnce(() => {
            PoolManager.setNode(this.node);
        }, 2);
    }
    update() {
        if (this.node.getWorldPosition().y < -1) {
            PoolManager.setNode(this.node);
        }
    }
}
