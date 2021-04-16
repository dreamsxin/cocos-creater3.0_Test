
import { _decorator, Component, Node, Vec3, random } from 'cc';
import { PoolManager } from '../utils/poolManager';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    private speed: number = 0.22;
    private target: Node = null as unknown as Node;

    shoot(target: Node) {
        this.target = target;
    }

    /**
     * 获取与目标间的距离
     */
    getDistance() {
        let v1: Vec3 = this.target.getWorldPosition();
        v1.y = 4;
        let v2: Vec3 = this.node.getWorldPosition();
        let out = new Vec3();
        out = Vec3.subtract(out, v1, v2);
        let distance = Vec3.len(out);
        return distance;
    }

    /**
     * 向目标射击,跟踪目标
     */
    moveToTarget() {
        let v1: Vec3 = this.target.getWorldPosition();
        v1.y = 4;
        let v2: Vec3 = this.node.getWorldPosition();
        let distance = this.getDistance();
        if (distance < 1) {
            PoolManager.setNode(this.node);
            this.target = null as unknown as Node;
            return;
        }

        /* 水平面 */
        let radian: number = Math.atan2(v1.x - v2.x, v1.z - v2.z);
        let speed = this.speed;
        let xx = Math.sin(radian) * speed;
        let zz = Math.cos(radian) * speed;
        v2.x += xx;
        v2.z += zz;

        /* 竖平面 */
        radian = Math.atan2(v1.z - v2.z, v1.y - v2.y);
        let yy = Math.cos(radian) * speed;
        v2.y += yy;

        this.node.setWorldPosition(v2);

    }

    update() {
        if (this.target) {
            this.moveToTarget();
        }
    }
}

