import Logger from "../utils/logger";
import EventManager from "./EventManager";
import ClientSocket from "../net/clientSocket";
import Room from "../controller/room";

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
    private _clientSockets: any[] = [];
    constructor() {
        EventManager.Instance.registerEevent(EventManager.EvtSaveClientSocket, this._evtSaveClientSocket.bind(this), this);
        EventManager.Instance.registerEevent(EventManager.EvtRemoveClientSocket, this._evtRemoveClientSocket.bind(this), this);
    }

    /**
     * 保存客户端socket
     * @param clientSocket 
     */
    private _evtSaveClientSocket(clientSocket: ClientSocket): void {
        this._clientSockets.push(clientSocket);
    }

    /**
     * 移除客户端socket
     * @param clientSocket 
     */
    private _evtRemoveClientSocket(clientSocket: ClientSocket): void {
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
    removeFromRoom(clientSocket: ClientSocket) {
        let rm: Room = this.getRoomById(clientSocket.roomId);
        if (rm) {
            rm.removeClient(clientSocket);
            if (rm.count < 1) {
                this.removeRoomFromList(rm);
            }
        }
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
     * @param pid 
     */
    public getClientSocketByPid(pid: number): ClientSocket {
        let cs: ClientSocket = this._clientSockets.find(item => { return item.id == pid });
        return cs;
    }

    /**
     * 获取所有客户端
     * @param pid 
     */
    public getAllClientSocket(pid: number): ClientSocket[] {
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
    createJoinRoom(client: ClientSocket): Room {
        let rm: Room = this.checkExitSingleRoom();
        if (rm) {
            rm.init(rm.id, client);
        }
        else {
            rm = new Room();
            let id = this.getId();
            rm.init(id, client);
            this.roomList.push(rm);
        }
        return rm;
    }

    /**
     * 根据房间ID获取玩家所在房间
     * @param roomId 
     * @returns 
     */
    getRoomById(roomId: number): Room {
        for (let i = 0; i < this.roomList.length; i++) {
            if (this.roomList[i].id == roomId) {
                return this.roomList[i];
            }
        }
        return null;
    }

    checkExitSingleRoom(): Room {
        for (let i = 0; i < this.roomList.length; i++) {
            if (this.roomList[i].count < 2) {
                return this.roomList[i];
            }
        }
        return null;
    }

}