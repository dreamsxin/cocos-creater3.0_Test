
import { _decorator, Component, Node, systemEvent, SystemEvent, SystemEventType, Vec2, geometry, Camera, PhysicsSystem } from 'cc';
import { ChessPiece } from './chessPiece';
const { ccclass, property } = _decorator;

@ccclass('ChinaChessMain')
export class ChinaChessMain extends Component {
    @property(Camera)
    mainCamera: Camera = null as unknown as Camera;

    start() {
        systemEvent.on(SystemEventType.TOUCH_START, this.touchStart, this);
    }

    touchStart(event: any) {
        let pos: Vec2 = event.getLocation();
        /* 从摄像机创建一条射线 */
        let ray: geometry.Ray = this.mainCamera.screenPointToRay(pos.x, pos.y);
        /* 从摄像机发射一条射线 */
        if (PhysicsSystem.instance.raycastClosest(ray)) {
            /* 检测穿过的物体,待检测的物体必须包含物理碰撞器 */
            let result = PhysicsSystem.instance.raycastClosestResult;
            if (result.collider) {
                let cp: ChessPiece = result.collider.node.getComponent(ChessPiece) as ChessPiece;

            }
        }
    }


}
