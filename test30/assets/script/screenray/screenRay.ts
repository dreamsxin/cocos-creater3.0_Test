
import { _decorator, Component, Node, Camera, systemEvent, SystemEventType, SystemEvent, Vec2, geometry, Vec3, PhysicsSystem, Label } from 'cc';
const { ccclass, property } = _decorator;
/**
 * 射线碰撞检测
 */
@ccclass('ScreenRay')
export class ScreenRay extends Component {
    @property(Camera)
    mainCamera: Camera = null as unknown as Camera;

    @property(Label)
    nameLable: Label = null as unknown as Label;

    //从摄像机发出一条射线,穿过屏幕触摸点,射入场景
    start() {
        //1:监听屏幕触摸事件
        systemEvent.on(SystemEventType.TOUCH_START, this.onTouchStart, this);
    }

    onTouchStart(event: any) {
        /* 屏幕点击坐标 */
        let screenPos: Vec2 = event._point;
        //2:从摄像机发出一条射线
        let ray: geometry.Ray = this.mainCamera.screenPointToRay(screenPos.x, screenPos.y);
        //3:检测射线碰撞结果,raycastClosest检测到最近的物体就返回
        if (PhysicsSystem.instance.raycastClosest(ray)) {
            let name = PhysicsSystem.instance.raycastClosestResult.collider.node.name;
            this.nameLable.string = name;
            console.log(name);
            console.log(PhysicsSystem.instance.raycastClosestResult.hitPoint);
        }
    }
}

