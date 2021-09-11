
import { _decorator, Component, Node, RigidBody, Vec3, ICollisionEvent, BoxColliderComponent } from 'cc';
import { PoolManager } from '../infinitymap/poolManager';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ArcheryArrow
 * DateTime = Sat Sep 11 2021 10:12:48 GMT+0700 (印度尼西亚西部时间)
 * Author = zfs533
 * FileBasename = archeryArrow.ts
 * FileBasenameNoExtension = archeryArrow
 * URL = db://assets/script/joystickarchery/archeryArrow.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('ArcheryArrow')
export class ArcheryArrow extends Component {

    private _isMoving: boolean = false;
    private _angle: Vec3 = new Vec3();

    onLoad() {
        const collider = this.node?.getComponent(BoxColliderComponent);
        if (collider) {
            collider?.on("onCollisionEnter", this._onCollisionEnter, this);
        }
    }

    /**
    * 碰撞检测
    * @param event 
    */
    _onCollisionEnter(event: ICollisionEvent) {
        const otherCollider = event.otherCollider;
        let name = otherCollider.node.name;
        PoolManager.setNode(this.node);
    }

    start() {
        this.scheduleOnce(() => {
            PoolManager.setNode(this.node);
        }, 2);
        // this.moveByApplyForce();
        this._angle = this.node.eulerAngles;
        this._isMoving = true;
    }
    update() {
        if (this._isMoving) {
            let angle = this._angle;
            let radian = angle.x / 180 * Math.PI;
            let pos = this.node.getWorldPosition();
            var speed = 0.5;
            let xx = Math.cos(radian) * speed;
            let zz = Math.sin(radian) * speed;
            this.node.setWorldPosition(new Vec3(pos.x + xx, pos.y, pos.z - zz));
        }
    }

    /**
     * 通过方向力发出去
     */
    moveByApplyForce() {
        var speed = 200;
        let angle = this.node.eulerAngles;
        let radian = angle.x / 180 * Math.PI;
        let force: Vec3 = new Vec3(Math.cos(radian) * speed, 0, -Math.sin(radian) * speed);
        let rb: RigidBody = this.node.getComponent(RigidBody) as unknown as RigidBody;
        rb.applyForce(force);
    }
}

