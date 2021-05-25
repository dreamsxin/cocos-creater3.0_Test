
import EventManager from "./EventManager";
import { User } from "../utils/globalUtils";

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
    /* 玩家数组 */
    private _user: User[] = [];
    constructor() {
        EventManager.Instance.registerEevent(EventManager.EvtSaveUserSocket, this._evtSaveUser.bind(this), this);
        EventManager.Instance.registerEevent(EventManager.EvtRemoveUserSocket, this._evtRemoveUser.bind(this), this);
    }

    /**
     * 保存客户端socket
     * @param user 
     */
    private _evtSaveUser(user: User): void {
        this._user.push(user);

    }
    /**
     * 移除客户端socket
     * @param user 
     */
    private _evtRemoveUser(user: User): void {
        /* 玩家有可能已加入房间,所以要过一遍从房间删除玩家的操作 */
        for (let i = 0; i < this._user.length; i++) {
            if (this._user[i].id == user.id) {
                this._user.splice(i, 1);
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

}