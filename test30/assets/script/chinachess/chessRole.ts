
import { _decorator, Component, Node, Vec3, SkeletalAnimationComponent, tween } from 'cc';
import { PoolManager } from '../infinitymap/poolManager';
import EventManager from '../shooting/eventManager';
import { ChessPlayer } from './chessPlayer';
import { joinRoomRes, ModelAny, moveReq, upLineReq } from './net/globalUtils';
import { Router } from './net/routers';
const { ccclass, property } = _decorator;

@ccclass('ChessRole')
export class ChessRole extends Component {
    public playerId: number = -1;
    private count: number = 0;

    onLoad() {
        EventManager.Inst.registerEevent(Router.rut_move, this.handleServerMove.bind(this), this);
        EventManager.Inst.registerEevent(Router.rut_downLine, this.handleServeplayerDownLine.bind(this), this);
        EventManager.Inst.registerEevent(Router.rut_joinRoom, this.handleServeJoinRoom.bind(this), this);
        EventManager.Inst.registerEevent(Router.rut_leaveRoom, this.handleServerLeaveRoom.bind(this), this);
    }

    init(playerId: number) {
        this.playerId = playerId;
    }

    handleServerMove(data: ModelAny) {
        let dt: moveReq = data.msg;
        /* 排除玩家自己 */
        if (dt.id == this.playerId && dt.id != ChessPlayer.Inst.playerId) {
            let v3: Vec3 = new Vec3(dt.x, dt.y, dt.z);
            this.handleRoleMove(v3);
        }
    }

    /**
     * 玩家走动
     * @param v3 
     */
    handleRoleMove(v3: Vec3) {
        if (this.count == 0) {
            (this.node.getComponent(SkeletalAnimationComponent) as SkeletalAnimationComponent).play("cocos_anim_run");
        }
        this.count++;
        let pos = v3;
        let radian = Math.atan2(pos.x - this.node.getWorldPosition().x, pos.z - this.node.getWorldPosition().z);
        let angle: number = radian * 180 / Math.PI;
        this.node.eulerAngles = new Vec3(0, angle, 0);

        let distance = this.getDistance(v3, this.node.getWorldPosition());
        let time = distance / 10;
        tween(this.node).to(time, { worldPosition: pos }).call(() => {
            this.count--;
            if (this.count == 0) {
                (this.node.getComponent(SkeletalAnimationComponent) as SkeletalAnimationComponent).play("cocos_anim_idle")
            }
        }).start();
    }

    /**
     * 获取两个三维坐标间的矢量长度
     * @param pos1 
     * @param pos2 
     * @returns 
     */
    getDistance(pos1: Vec3, pos2: Vec3): number {
        let out: Vec3 = new Vec3();
        Vec3.subtract(out, pos1, pos2);
        let distance = out.length();
        return distance;
    }

    /**
     * 玩家下线
     * @param data 
     */
    handleServeplayerDownLine(data: ModelAny) {
        let dt: upLineReq = data.msg;
        if (dt.id == this.playerId) {
            PoolManager.setNode(this.node);
            EventManager.Inst.dispatchEvent(EventManager.EVT_chessDownLine, this.playerId);
        }
    }

    /**
     * 玩家进入房间
     * @param data 
     */
    handleServeJoinRoom(data: ModelAny) {
        let dt: joinRoomRes = data.msg;
        if (dt.id == this.playerId && dt.id != ChessPlayer.Inst.playerId) {
            this.node.active = false;
        }
    }

    /**
     * 玩家离开房间
     * @param data 
     */
    handleServerLeaveRoom(data: ModelAny) {
        let dt: joinRoomRes = data.msg;
        if (dt.id == this.playerId && dt.id != ChessPlayer.Inst.playerId) {
            this.node.active = true;
        }
    }

}
