
import { _decorator, Component, Node, Vec3, PhysicsSystem, director, RigidBodyComponent, systemEvent, SystemEvent, EventTouch } from 'cc';
import { clientEvent } from '../framwork/clientEvent';
import { Constant } from '../framwork/constant';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ArcheryCamera
 * DateTime = Fri Sep 10 2021 11:22:51 GMT+0700 (印度尼西亚西部时间)
 * Author = zfs533
 * FileBasename = archeryCamera.ts
 * FileBasenameNoExtension = archeryCamera
 * URL = db://assets/script/joystickarchery/archeryCamera.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('ArcheryCamera')
export class ArcheryCamera extends Component {
    private _followRole: Node = null as unknown as Node;
    private _oriCameraWorPos: Vec3 = new Vec3();
    private _curCameraWorPos: Vec3 = new Vec3();
    private _targetCameraWorPos: Vec3 = new Vec3();
    private _offsetCameraPos: Vec3 = new Vec3();
    onLoad() {
        clientEvent.on(Constant.EVENT_TYPE.CarmeraRole, this._setFloowRole, this);
        this._oriCameraWorPos = this.node.getPosition().clone();
        this._test();

    }
    onDestroy() {
        clientEvent.off(Constant.EVENT_TYPE.CarmeraRole, this._setFloowRole, this);
    }

    private _setFloowRole(role: Node) {
        Vec3.subtract(this._offsetCameraPos, role.getPosition(), this.node.getPosition());
        this._followRole = role;
    }

    lateUpdate() {
        if (!this._followRole) return;
        this._targetCameraWorPos = this._targetCameraWorPos.lerp(this._followRole.worldPosition, 0.5);
        this._curCameraWorPos.set(-this._offsetCameraPos.x + this._targetCameraWorPos.x, this._oriCameraWorPos.y, -this._offsetCameraPos.z + this._targetCameraWorPos.z);
        this.node.setWorldPosition(this._curCameraWorPos);
    }
    private _test() {
        // systemEvent.on(SystemEvent.EventType.TOUCH_MOVE, this._onTouchMove, this);
    }


    private _tempPos: Vec3 = new Vec3();
    private _onTouchMove(touch: any) {

        if (!this._followRole) return;
        /* 相机以角色为中心,做绕角色Y轴的旋转,摄像机始终指向角色 */

        const delta = touch.getDelta();
        const rad2 = 1e-2 * delta.x; //旋转角度
        let p1 = this.node.worldPosition;
        let p2 = this._followRole.worldPosition;
        Vec3.rotateY(this._tempPos, this.node.worldPosition, this._followRole.worldPosition, rad2);
        //设置相机位置
        this.node.setWorldPosition(this._tempPos);

        //设置相机角度
        let radius = Math.atan2(p1.z - p2.z, p1.x - p2.x);
        let angle = radius * 180 / Math.PI;
        let euler = new Vec3(this.node.eulerAngles.x, -angle + 90, this.node.eulerAngles.z);
        this.node.eulerAngles = euler;

    }
}


