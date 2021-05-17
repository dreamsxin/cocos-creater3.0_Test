
import { _decorator, Component, Node, Camera, SystemEventType, systemEvent, Vec2, geometry, PhysicsSystem, Vec3, tween, SkeletalAnimationComponent, Prefab } from 'cc';
import { PoolManager } from '../infinitymap/poolManager';
import EventManager from '../shooting/eventManager';
import { ChessType } from './chessEnum';
import { ChessPlayer } from './chessPlayer';
import Room from './chessRoom';
import RoomtManager from './chessRoomMgr';
import { createRoomReq, createRoomRes, ModelAny, restartReq } from './net/globalUtils';
import { Net } from './net/net';
import { Router } from './net/routers';
const { ccclass, property } = _decorator;

@ccclass('ChessRoomNode')
export class ChessRoomNode extends Component {
    @property(Camera)
    mainCamera: Camera = null as unknown as Camera;

    @property(Node)
    leaveBtn: Node = null as unknown as Node;

    @property(Node)
    role: Node = null as unknown as Node;

    @property(Prefab)
    desk: Prefab = null as unknown as Prefab;

    @property(Node)
    gameNode: Node = null as unknown as Node;

    private isMoving: boolean = false;
    private count: number = 0;

    /* 当前选中的房间ID */
    private currentRoomId: number = 0;

    private isJoinRoom: boolean = false;

    onLoad() {
        EventManager.Inst.registerEevent(Router.rut_createRoom, this.handleServerCreateRoom.bind(this), this);
        EventManager.Inst.registerEevent(Router.rut_restart, this.handleServerRestart.bind(this), this);
        EventManager.Inst.registerEevent(Router.rut_leaveRoom, this.handleServerLeaveRoom.bind(this), this);
    }

    start() {
        this.leaveBtn.active = false;
        systemEvent.on(SystemEventType.TOUCH_START, this.touchStart, this);
    }
    onEnable() {
        this.resetCameraPos();
        this.layoutDesk();
    }
    onDisable() {
        this.gameNode.active = false;
        this.leaveBtn.active = false;
    }

    touchStart(event: any) {
        let pos: Vec2 = event.getLocation();
        /* 从摄像机创建一条射线 */
        let ray: geometry.Ray = this.mainCamera.screenPointToRay(pos.x, pos.y);
        /* 从摄像机发射一条射线 */
        if (PhysicsSystem.instance.raycastClosest(ray)) {
            /* 检测穿过的物体,待检测的物体必须包含物理碰撞器 */
            let result = PhysicsSystem.instance.raycastClosestResult;
            let point = result.hitPoint;
            if (result.collider.node.name == "roomList") {
                this.handleRoleMove(point);
            }
            else if (result.collider.node.name == "chessDesk") {
                /* 得到当前房间ID */
                this.currentRoomId = (result.collider.node.getComponent(Room) as Room).roomId;
                let pos = this.role.getWorldPosition();
                let distance = this.getDistance(pos, point);
                this.checkCanJoinRoom(distance);
                console.log(distance, this.isMoving);
            }
            console.log(result.collider.node.name);
        }
    }

    /**
     * 摄像机位置设置
     */
    resetCameraPos() {
        let rolePos = this.role.getWorldPosition();
        let cameraPos = new Vec3(rolePos.x + 22, 10, rolePos.z);
        this.mainCamera.node.eulerAngles = new Vec3(-17, 90, 0);
        this.mainCamera.node.setPosition(cameraPos);
    }

    /**
     * 玩家走动
     * @param v3 
     */
    handleRoleMove(v3: Vec3) {
        if (this.isJoinRoom) { return; }
        if (this.count == 0) {
            (this.role.getComponent(SkeletalAnimationComponent) as SkeletalAnimationComponent).play("cocos_anim_run");
        }
        this.count++;
        this.isMoving = true;
        let pos = v3;
        let radian = Math.atan2(pos.x - this.role.getWorldPosition().x, pos.z - this.role.getWorldPosition().z);
        this.isMoving = true;
        let angle: number = radian * 180 / Math.PI;
        this.role.eulerAngles = new Vec3(0, angle, 0);

        let distance = this.getDistance(v3, this.role.getWorldPosition());
        let time = distance / 10;
        tween(this.role).to(time, { worldPosition: pos }).call(() => {
            this.count--;
            if (this.count == 0) {
                this.isMoving = false;
                (this.role.getComponent(SkeletalAnimationComponent) as SkeletalAnimationComponent).play("cocos_anim_idle")
            }
        }).start();
    }

    update() {
        if (this.isMoving) {
            this.resetCameraPos();
        }
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
     * 排列棋桌
     */
    layoutDesk() {
        let rmMgr = RoomtManager.Instance;
        let list = rmMgr.roomInfoList;
        let len: number = Math.sqrt(list.length);
        let cout: number = 0;
        if (rmMgr.roomList.length < 1) {
            for (let z = 0; z < len; z++) {
                for (let x = 0; x < len; x++) {
                    let ds: Node = PoolManager.getNode(this.desk);
                    this.node.addChild(ds);
                    let pos: Vec3 = new Vec3(-(len * 15 / 2) + x * 15, 0, len * 18 / 2 - z * 18);
                    ds.setWorldPosition(pos);
                    let rm: Room = ds.getComponent(Room) as Room;
                    rm.init(list[cout].roomId, list[cout].count);
                    rmMgr.roomList.push(rm);
                    cout++;
                }
            }
        }
        rmMgr.updateRoomList();
    }

    /**
     * 当玩家与桌子足够近的时候,点击桌子发送加入房间请求
     * @param distance 
     */
    checkCanJoinRoom(distance: number) {
        if (distance < 6 && !this.isMoving) {
            let data: createRoomReq = { roomId: this.currentRoomId };
            Net.sendMsg(data, Router.rut_createRoom);
        }
    }

    /**
     * 离开房间
     */
    handleLeaveRoom() {
        Net.sendMsg({}, Router.rut_leaveRoom);
    }

    /* 接收到服务器其他玩家消息 */
    /**
     * 创建房间
     * @param data 
     */
    handleServerCreateRoom(data: ModelAny) {
        this.isJoinRoom = true;
        this.role.active = false;
        this.leaveBtn.active = true;

        let rmData: createRoomRes = data.msg;
        let room: Room = RoomtManager.Instance.getRoomById(rmData.roomId);
        room.init(rmData.roomId, rmData.count);
        if (room.count == 1) {
            ChessPlayer.Inst.type = ChessType.red;
            ChessPlayer.Inst.roomId = rmData.roomId;
        }
        else if (room.count == 2) {
            if (ChessPlayer.Inst.roomId < 0) {
                ChessPlayer.Inst.roomId = rmData.roomId;
                ChessPlayer.Inst.type = ChessType.black;
            }
        }
        if (room.count == 2) {
            this.node.active = false;
            this.gameNode.active = true;
        }
    }

    /**
     * 离开房间,重新选房间
     * @param data 
     */
    handleServerRestart(data: ModelAny) {
        let dt: restartReq = data.msg;
        if (dt.type == ChessPlayer.Inst.type) {
            this.role.active = true;
            this.isJoinRoom = false;
            this.leaveBtn.active = false;
        }
        else {
            console.log("对家离开")
        }
    }
    /**
     * 离开房间,重新选房间
     * @param data 
     */
    handleServerLeaveRoom(data: ModelAny) {
        this.role.active = true;
        this.isJoinRoom = false;
        this.leaveBtn.active = false;
    }

}

