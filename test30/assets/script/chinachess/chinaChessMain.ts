
import { _decorator, Component, Node, systemEvent, SystemEvent, SystemEventType, Vec2, geometry, Camera, PhysicsSystem, Vec3 } from 'cc';
import { ChessGrid } from './chessGrid';
import { ChessPiece } from './chessPiece';
const { ccclass, property } = _decorator;

@ccclass('ChinaChessMain')
export class ChinaChessMain extends Component {
    @property(Camera)
    mainCamera: Camera = null as unknown as Camera;

    @property(ChessGrid)
    chessGd: ChessGrid = null as unknown as ChessGrid;

    start() {
        systemEvent.on(SystemEventType.TOUCH_START, this.touchStart, this);
    }

    touchStart(event: any) {
        this.chessGd.hideAllSelected();
        let pos: Vec2 = event.getLocation();
        /* 从摄像机创建一条射线 */
        let ray: geometry.Ray = this.mainCamera.screenPointToRay(pos.x, pos.y);
        /* 从摄像机发射一条射线 */
        if (PhysicsSystem.instance.raycastClosest(ray)) {
            /* 检测穿过的物体,待检测的物体必须包含物理碰撞器 */
            let result = PhysicsSystem.instance.raycastClosestResult;
            if (result.collider.node.name == "chessPrefab") {
                let cp: ChessPiece = result.collider.node.getComponent(ChessPiece) as ChessPiece;
                cp.setSelected(true);
                this.chessGd.evtHandleSelected(cp);
            }
            else if (result.collider.node.name == "qipan") {
                let pos = this.handleDetailPos(result.hitPoint);
                console.log(pos);
                //走棋
            }
        }
    }

    /**
     * 将点击点转换到网格点上
     * @param hitPoint 
     */
    handleDetailPos(hitPoint: Vec3): Vec3 {
        let hor = this.chessGd.hor;
        let ver = this.chessGd.ver;
        let grids = this.chessGd.gridArr;
        for (let x = 0; x < hor; x++) {
            for (let z = 0; z < ver; z++) {
                if (Math.abs(grids[x][z].x - hitPoint.x) < 1 && Math.abs(grids[x][z].z - hitPoint.z) < 1) {
                    return grids[x][z];
                }
            }
        }
        return null as unknown as Vec3;
    }
}
