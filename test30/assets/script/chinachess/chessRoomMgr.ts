import { _decorator, Node, Label } from 'cc';
import { PoolManager } from '../infinitymap/poolManager';
import EventManager from "../shooting/eventManager";
import Room from "./chessRoom";
import { createRoomRes, ModelAny, playerInfoRes, upLineReq } from "./net/globalUtils";
import { Router } from "./net/routers";

/* 客户端 socket 连接管理 */
export default class RoomtManager {
    private static _instance: RoomtManager;
    private _index: number = 1000;
    public roomInfoList: createRoomRes[] = [];
    public playerList: number[] = [];
    public static get Instance(): RoomtManager {
        if (!RoomtManager._instance) {
            RoomtManager._instance = new RoomtManager();
        }
        return RoomtManager._instance;
    }

    /* 房间列表 */
    public roomList: Room[] = [];


    init() {
        EventManager.Inst.registerEevent(Router.rut_playerInfo, this.handleServeplayerInfo.bind(this), this);
        EventManager.Inst.registerEevent(Router.rut_downLine, this.handleServeplayerDownLine.bind(this), this);
    }

    /**
     * 初始化并更新房间信息
     * @param data 
     */
    initRoomListData(data: createRoomRes[]) {
        this.roomInfoList = data;
        if (this.roomList.length > 0) {
            this.updateRoomList();
        }
    }

    public clearRoomList() {
        for (let i = 0; i < this.roomList.length; i++) {
            PoolManager.setNode(this.roomList[i].node);
        }
        this.roomList.splice(0);
        this.playerList.splice(0);
    }

    /**
     * 刷新房间列表数据
     */
    updateRoomList() {
        let data = this.roomInfoList;
        for (let i = 0; i < data.length; i++) {
            let rm: Room = this.getRoomById(data[i].roomId);
            if (rm) {
                rm.init(data[i].roomId, data[i].count);
            }
        }
    }


    /**
     * 根据房间ID获取玩家所在房间
     * @param roomId 
     * @returns 
     */
    getRoomById(roomId: number): Room {
        for (let i = 0; i < this.roomList.length; i++) {
            if (this.roomList[i].roomId == roomId) {
                return this.roomList[i];
            }
        }
        return null as unknown as Room;
    }

    /**
     * 将新上线的玩家添加到玩家列表
     * @param id 
     * @returns 
     */
    addToPlayerList(id: number) {
        for (let i = 0; i < this.playerList.length; i++) {
            if (id == this.playerList[i]) {
                return;
            }
        }
        this.playerList.push(id);
    }

    /**
     * 将玩家从列表中删除
     * @param id 
     * @returns 
     */
    removeToPlayerList(id: number) {
        for (let i = 0; i < this.playerList.length; i++) {
            if (id == this.playerList[i]) {
                this.playerList.splice(i, 1);
                break;
            }
        }
    }

    /**
     * 玩家列表
     * @param data 
     */
    handleServeplayerInfo(data: ModelAny) {
        let dt: playerInfoRes = data.msg;
        this.playerList = dt.id;
    }

    /**
     * 玩家下线
     * @param data 
     */
    handleServeplayerDownLine(data: ModelAny) {
        let dt: upLineReq = data.msg;
        this.removeToPlayerList(dt.id);
        console.log("玩家下线 " + dt.id)
    }

}