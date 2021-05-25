import Logger from "../utils/logger";
import EventManager from "./EventManager";
import ClientSocket from "../net/clientSocket";
import Room from "../controller/room";
import { moveReq, restartReq } from "../utils/globalUtils";

/* 客户端 socket 连接管理 */
export default class ClientManager {
    private static _instance: ClientManager;
    private _index: number = 1000;
    public static get Instance(): ClientManager {
        if (!ClientManager._instance) {
            ClientManager._instance = new ClientManager();
        }
        return ClientManager._instance;
    }
    /* 房间列表 */
    public roomList: Room[] = [];
    /* 客户端socket数组 */
    private _clientSockets: ClientSocket[] = [];
    constructor() {
        this.initRoomList();
        EventManager.Instance.registerEevent(EventManager.EvtSaveClientSocket, this._evtSaveClientSocket.bind(this), this);
        EventManager.Instance.registerEevent(EventManager.EvtRemoveClientSocket, this._evtRemoveClientSocket.bind(this), this);
    }

    /**
     * 保存客户端socket
     * @param clientSocket 
     */
    private _evtSaveClientSocket(clientSocket: ClientSocket): void {
        this._clientSockets.push(clientSocket);
        /* 通知其他人,他上线了 */
        // let list = this._clientSockets;
        // for (let i = 0; i < list.length; i++) {
        //     list[i].pushUplineToClient(clientSocket.id);
        // }

    }

    /**
     * 移除客户端socket
     * @param clientSocket 
     */
    private _evtRemoveClientSocket(clientSocket: ClientSocket): void {
        /* 玩家有可能已加入房间,所以要过一遍从房间删除玩家的操作 */
        // this.pushDownLineToAllClient(clientSocket.id);
        this.removeFromRoom(clientSocket);
        // for (let i = 0; i < this._clientSockets.length; i++) {
        //     if (this._clientSockets[i].id == clientSocket.id) {
        //         this._clientSockets.splice(i, 1);
        //         break;
        //     }
        // }
    }

    /**
     * 玩家离开房间
     * @param clientSocket 
     */
    removeFromRoom(clientSocket: ClientSocket, req?: restartReq) {
        // let rm: Room = this.getRoomById(clientSocket.roomId);
        // if (rm) {
        //     rm.removeClient(clientSocket, req);
        // }
    }

    /**
     * 从房间列表将空房间移除
     * @param rm 
     */
    removeRoomFromList(rm: Room) {
        for (let i = 0; i < this.roomList.length; i++) {
            if (this.roomList[i].id == rm.id) {
                this.roomList.splice(i, 0);
                break;
            }
        }
    }

    /**
     * 获取客户端唯一标示id
     */
    public getId(): number {
        return this._index++;
    }

    /**
     * 根据pid获取clientsocket
     * @param id 
     */
    public getClientSocketByPid(id: number): ClientSocket {
        let cs: ClientSocket = this._clientSockets.find(item => { return item.id == id });
        return cs;
    }

    public getAllClient(): ClientSocket[] {
        return this._clientSockets;
    }

    /**
     * 根据房间ID获取玩家所在房间
     * @param roomId 
     * @returns 
     */
    getRoomById(roomId: number): Room {
        for (let i = 0; i < this.roomList.length; i++) {
            if (this.roomList[i].id == roomId && this.roomList[i].count <= 2) {
                return this.roomList[i];
            }
        }
        return null;
    }

    /**
     * 检测是玩家否已经在房间
     * @returns 
     */
    checkExistInRoom(userId: number): Room {
        for (let i = 0; i < this.roomList.length; i++) {
            let room = this.roomList[i];
            if (room.count > 0) {
                if (room.userList.find((id) => { return id == userId })) {
                    return room;
                }
            }
        }
        return null;
    }

    /**
     * 初始化房间列表
     */
    initRoomList() {
        /* 房间数量一定要是开平方根为整数的数字 */
        for (let i = 0; i < 16; i++) {
            let rm = new Room();
            let id = this.getId();
            rm.init(id);
            this.roomList.push(rm);
        }
    }

    /**
     * 推送移动数据,出了自己以外的所有客户端
     * @param data 
     */
    pushMoveInfoToAllClient(data: moveReq) {
        let list = this._clientSockets;
        // for (let i = 0; i < list.length; i++) {
        //     if (list[i].id == data.id) continue;
        //     list[i].pushMoveInfoToClient(data);
        // }
    }

    /**
     * 推送玩家下线数据给所有客户端
     * @param id 
     */
    pushDownLineToAllClient(id: number) {
        let list = this._clientSockets;
        // for (let i = 0; i < list.length; i++) {
        //     if (list[i].id == id) continue;
        //     list[i].pushDownlineToClient(id);
        // }
    }

    /**
     * 推送玩家离开房间给所有客户端
     * @param id 
     */
    pushLeaveRoomToAllClient(id: number) {
        let list = this._clientSockets;
        // for (let i = 0; i < list.length; i++) {
        //     if (list[i].id == id) continue;
        //     list[i].pushLeaveRoomToClient(id);
        // }
    }

}