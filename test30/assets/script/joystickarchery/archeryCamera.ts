
import { _decorator, Component, Node, Vec3, PhysicsSystem, director, RigidBodyComponent, systemEvent, SystemEvent, EventTouch, CameraComponent } from 'cc';
import { unitVec3 } from '../chinachess/net/util';
import { clientEvent } from '../framwork/clientEvent';
import { Constant } from '../framwork/constant';
import { Archery } from './archery';
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
    public static mainCamera: CameraComponent | null = null;//相机组件
    private _followRole: Node = null as unknown as Node;//相机跟随对象
    private _oriCameraWorPos: Vec3 = new Vec3();//相机初始位置
    private _oriCameraEuler: Vec3 = new Vec3();//相机初始欧拉角

    private _tempPos: Vec3 = new Vec3();//临时中间变量
    private _isRotating: boolean = false;
    private _speed: number = 0.1;//移动速度,和角色移动速度一致
    private _angleOffSet: number = 0;//旋转摄像机的角度偏移,影响旋转摄像机后玩家移动方向(相对初始方向)
    onLoad() {
        clientEvent.on(Constant.EVENT_TYPE.CarmeraRole, this._setFloowRole, this);
        clientEvent.on(Constant.EVENT_TYPE.CarmeraRotate, this._setCarmeraRotate, this);
        clientEvent.on(Constant.EVENT_TYPE.MoveEnd, this._moveEnd, this);
        clientEvent.on(Constant.EVENT_TYPE.StartMoving, this._startMoving, this);
        this._oriCameraWorPos = this.node.getPosition().clone();
        this._oriCameraEuler = this.node.eulerAngles.clone();
        ArcheryCamera.mainCamera = this.node.getComponent(CameraComponent);
        this._test();

    }
    onDestroy() {
        clientEvent.off(Constant.EVENT_TYPE.CarmeraRole, this._setFloowRole, this);
        clientEvent.off(Constant.EVENT_TYPE.CarmeraRotate, this._setCarmeraRotate, this);
        clientEvent.off(Constant.EVENT_TYPE.MoveEnd, this._moveEnd, this);
        clientEvent.off(Constant.EVENT_TYPE.StartMoving, this._startMoving, this);
    }

    /**
     * 设置相机跟随对象
     * @param role 
     */
    private _setFloowRole(role: Node) {
        this._followRole = role;
    }

    private _test() {
    }

    /**
     * 相机移动,和角色的移动方向速度一致
     * @param angle 
     * @param radius 
     */
    private _startMoving(angle: number, radius: number) {
        let zz = Math.cos(radius) * this._speed;
        let xx = Math.sin(radius) * this._speed;
        this._oriCameraWorPos.add(new Vec3(xx, 0, zz));
        this.node.setPosition(this._oriCameraWorPos);
    }

    private _moveEnd() {
        this._isRotating = false;
        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AngleOffset, this._angleOffSet);
    }

    private _setCarmeraRotate(touch: EventTouch) {
        if (!this._followRole) return;
        this._isRotating = true;
        /* 相机以角色为中心,做绕角色Y轴的旋转,摄像机始终指向角色 */
        const delta = touch.getDelta();
        const rad2 = 1e-2 * delta.x; //旋转角度
        let p1 = this.node.worldPosition;
        let p2 = this._followRole.worldPosition;
        Vec3.rotateY(this._tempPos, this.node.worldPosition, this._followRole.worldPosition, rad2);
        //设置相机位置
        this.node.setWorldPosition(this._tempPos);
        this._oriCameraWorPos = this._tempPos;

        //设置相机角度
        let radius = Math.atan2(p1.z - p2.z, p1.x - p2.x);
        let angle = radius * 180 / Math.PI;
        let euler = new Vec3(this.node.eulerAngles.x, -angle + 90, this.node.eulerAngles.z);
        this.node.eulerAngles = euler;

        this._angleOffSet = this._oriCameraEuler.y - euler.y;
    }
}


