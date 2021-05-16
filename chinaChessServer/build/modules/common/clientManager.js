"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventManager_1 = require("./EventManager");
const room_1 = require("../controller/room");
/* 客户端 socket 连接管理 */
class ClientManager {
    constructor() {
        this._index = 1000;
        /* 房间列表 */
        this.roomList = [];
        /* 客户端socket数组 */
        this._clientSockets = [];
        this.initRoomList();
        EventManager_1.default.Instance.registerEevent(EventManager_1.default.EvtSaveClientSocket, this._evtSaveClientSocket.bind(this), this);
        EventManager_1.default.Instance.registerEevent(EventManager_1.default.EvtRemoveClientSocket, this._evtRemoveClientSocket.bind(this), this);
    }
    static get Instance() {
        if (!ClientManager._instance) {
            ClientManager._instance = new ClientManager();
        }
        return ClientManager._instance;
    }
    /**
     * 保存客户端socket
     * @param clientSocket
     */
    _evtSaveClientSocket(clientSocket) {
        this._clientSockets.push(clientSocket);
    }
    /**
     * 移除客户端socket
     * @param clientSocket
     */
    _evtRemoveClientSocket(clientSocket) {
        /* 玩家有可能已加入房间,所以要过一遍从房间删除玩家的操作 */
        this.removeFromRoom(clientSocket);
        for (let i = 0; i < this._clientSockets.length; i++) {
            if (this._clientSockets[i].id == clientSocket.id) {
                this._clientSockets.splice(i, 1);
                break;
            }
        }
    }
    /**
     * 玩家离开房间
     * @param clientSocket
     */
    removeFromRoom(clientSocket, req) {
        let rm = this.getRoomById(clientSocket.roomId);
        if (rm) {
            rm.removeClient(clientSocket, req);
            // if (rm.count < 1) {
            //     this.removeRoomFromList(rm);
            // }
        }
    }
    /**
     * 从房间列表将空房间移除
     * @param rm
     */
    removeRoomFromList(rm) {
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
    getId() {
        return this._index++;
    }
    /**
     * 根据pid获取clientsocket
     * @param pid
     */
    getClientSocketByPid(pid) {
        let cs = this._clientSockets.find(item => { return item.id == pid; });
        return cs;
    }
    /**
     * 获取所有客户端
     * @param pid
     */
    getAllClientSocket(pid) {
        let list = [];
        for (let i = 0; i < this._clientSockets.length; i++) {
            if (this._clientSockets[i].pid != pid) {
                list.push(this._clientSockets[i]);
            }
        }
        return list;
    }
    /**
     * 房间请求
     * @param id
     * @param client
     */
    createJoinRoom(client, roomId) {
        let rm = this.getRoomById(roomId);
        rm.updateInfo(client);
        return rm;
    }
    /**
     * 根据房间ID获取玩家所在房间
     * @param roomId
     * @returns
     */
    getRoomById(roomId) {
        for (let i = 0; i < this.roomList.length; i++) {
            if (this.roomList[i].id == roomId && this.roomList[i].count <= 2) {
                return this.roomList[i];
            }
        }
        return null;
    }
    /**
     * 检测只有一人的房间
     * @returns
     */
    checkExitSingleRoom() {
        for (let i = 0; i < this.roomList.length; i++) {
            if (this.roomList[i].count < 2) {
                return this.roomList[i];
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
            let rm = new room_1.default();
            let id = this.getId();
            rm.init(id);
            this.roomList.push(rm);
        }
    }
    /**
     * 更新房间列表信息,给所有玩家推送
     */
    pushUpdateRoomToAllClient() {
        let list = this._clientSockets;
        for (let i = 0; i < list.length; i++) {
            list[i].pushRoomListToClient();
        }
    }
}
exports.default = ClientManager;
