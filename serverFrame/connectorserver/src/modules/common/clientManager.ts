import EventManager from "./EventManager";
import ServerClientSocket from "../net/serverClientSocket";
import ClientSocket from "../net/clientSocket";
import { ModelAny } from "../utils/globalUtils";

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

    /* 客户端socket数组 */
    private _clientSockets: ClientSocket[] = [];
    /* 服务器客户端socket数组 */
    private _serverClientSockets: ServerClientSocket[] = [];
    constructor() {
        EventManager.Instance.registerEevent(EventManager.EvtSaveClientSocket, this._evtSaveClientSocket.bind(this), this);
        EventManager.Instance.registerEevent(EventManager.EvtSaveServerClientSocket, this._evtSaveServerClientSocket.bind(this), this);
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
     * 保存服务器客户端socket
     * @param clientSocket 
     */
    private _evtSaveServerClientSocket(serverClientSocket: ServerClientSocket): void {
        this._serverClientSockets.push(serverClientSocket);
    }

    /**
     * 移除客户端socket
     * @param clientSocket 
     */
    private _evtRemoveClientSocket(clientSocket: ClientSocket): void {
        /* 玩家有可能已加入房间,所以要过一遍从房间删除玩家的操作 */
        for (let i = 0; i < this._clientSockets.length; i++) {
            if (this._clientSockets[i].id == clientSocket.id) {
                this._clientSockets.splice(i, 1);
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
    public getClientSocketById(id: number): ClientSocket {
        let cs: ClientSocket = this._clientSockets.find(item => { return item.id == id });
        return cs;
    }

    /**
     * 根据服务器类型获取服务器
     * @param serverType
     */
    public getServerClientSocketByType(serverType: number): ServerClientSocket {
        let scs: ServerClientSocket = this._serverClientSockets.find(item => { return item.serverType == serverType });
        return scs;
    }

    public getAllClient(): ClientSocket[] {
        return this._clientSockets;
    }

    /**
     * 玩家上线,推送
     * @param clientSocket 
     */
    public pushUpLineToAllClient(id: number): void {
        /* 通知其他人,他上线了 */
        let list = this._clientSockets;
        for (let i = 0; i < list.length; i++) {
            list[i].pushUplineToClient(id);
        }
    }

    /**
     * 推送玩家下线数据给所有客户端
     * @param id 
     */
    pushDownLineToAllClient(id: number) {
        let list = this._clientSockets;
        for (let i = 0; i < list.length; i++) {
            if (list[i].id == id) continue;
            list[i].pushDownlineToClient(id);
        }
    }

    /**
     * 更新房间列表信息,给所有玩家推送
     */
    pushUpdateRoomToAllClient(data: ModelAny) {
        let list = this._clientSockets;
        for (let i = 0; i < list.length; i++) {
            list[i].pushRoomListToClient(data);
        }
    }

    /**
     * 推送玩家进入房间给所有客户端
     * @param id 
     */
    pushJoinRoomToAllClient(id: number) {
        let list = this._clientSockets;
        for (let i = 0; i < list.length; i++) {
            if (list[i].id == id) continue;
            list[i].pushJoinRoomToClient(id);
        }
    }

}