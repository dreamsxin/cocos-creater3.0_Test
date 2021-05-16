
import { _decorator, Component, Node, systemEvent, SystemEvent, SystemEventType, Vec2, geometry, Camera, PhysicsSystem, Vec3 } from 'cc';
import EventManager from '../shooting/eventManager';
import { ChessGrid } from './chessGrid';
import { ChessPiece } from './chessPiece';
import { ChessPlayer } from './chessPlayer';
import { eatChessReq, ModelAny, playChessReq } from './net/globalUtils';
import { Router } from './net/routers';
const { ccclass, property } = _decorator;

@ccclass('ChinaChessMain')
export class ChinaChessMain extends Component {
    @property(Camera)
    mainCamera: Camera = null as unknown as Camera;

    @property(ChessGrid)
    chessGd: ChessGrid = null as unknown as ChessGrid;


    @property(Node)
    switchBtn: Node = null as unknown as Node;

    onLoad() {
        EventManager.Inst.registerEevent(Router.rut_playChess, this.handleServerPlayChess.bind(this), this);
        EventManager.Inst.registerEevent(Router.rut_eatChess, this.handleServerEatChess.bind(this), this);
    }

    start() {
        systemEvent.on(SystemEventType.TOUCH_START, this.touchStart, this);
    }

    onEnable() {
        this.switchBtn.active = true;
        this.startGame();
    }
    onDisable() {
        this.switchBtn.active = false;
    }

    touchStart(event: any) {
        if (this.chessGd.isMoving) return;
        let pos: Vec2 = event.getLocation();
        /* 从摄像机创建一条射线 */
        let ray: geometry.Ray = this.mainCamera.screenPointToRay(pos.x, pos.y);
        /* 从摄像机发射一条射线 */
        if (PhysicsSystem.instance.raycastClosest(ray)) {
            /* 检测穿过的物体,待检测的物体必须包含物理碰撞器 */
            let result = PhysicsSystem.instance.raycastClosestResult;
            if (result.collider.node.name == "chessPrefab") {
                let cp: ChessPiece = result.collider.node.getComponent(ChessPiece) as ChessPiece;
                this.chessGd.evtHandleSelected(cp);
                return;
            }
            else if (result.collider.node.name == "qipan") {
                let pos = this.handleDetailPos(result.hitPoint);
                if (pos) {
                    this.chessGd.moveToTargetPos(pos);
                    return;
                }
            }
        }
        this.chessGd.hideAllSelected();
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

    /**
     * 开局
     */
    startGame() {
        this.chessGd.startGame();
    }

    /* 接收到服务器其他玩家消息 */
    /**
     * 走棋/落子
     * @param data 
     */
    handleServerPlayChess(data: ModelAny) {
        let rmData: playChessReq = data.msg;
        let cp: ChessPiece = this.chessGd.getChessPieceByRole(rmData.role, rmData.type, rmData.ox, rmData.oz);
        let pos: Vec3 = this.chessGd.gridArr[rmData.x][rmData.z];
        if (cp) {
            this.chessGd.curSelectChess = cp;
            this.chessGd.moveToTargetPos(pos, () => { }, [pos]);
        }
    }

    /**
     * 吃棋子
     * @param data 
     */
    handleServerEatChess(data: ModelAny) {
        let rmData: eatChessReq = data.msg;
        let cp: ChessPiece = this.chessGd.getChessPieceByRole(rmData.role, rmData.type, rmData.ox, rmData.oz);
        let pos: Vec3 = this.chessGd.gridArr[rmData.ox][rmData.oz];
        if (cp) {
            this.chessGd.handleEatChess(cp, pos);
        }
    }

}
