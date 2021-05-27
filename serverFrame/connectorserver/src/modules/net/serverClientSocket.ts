import ClientManager from "../common/clientManager";
import { createRoomReq, createRoomRes, eatChessReq, Head, ModelAny, restartReq, User } from "../utils/globalUtils";
import DataViewUtils from "../utils/dataviewUtils";
import Logger from "../utils/logger";
import { Router } from "../controller/routers";
import Net from "./net";
import ClientSocket from "./clientSocket";
import { ErrEnum } from "../utils/err";
import { ServerType } from "../../config/config";

/* 客户端连接socket类 */
export default class ServerClientSocket {
    /* socket连接对象，收发数据 */
    public socket: any;
    public serverId: number = 0;
    public serverType: number = 0;
    private dataType: any;
    private ip: string = "";
    private port: number = 0;

    constructor(socket: any, serverType: number, port: number, ip: string) {
        this.socket = socket;
        this.port = port;
        this.ip = ip;
        this.serverType = serverType;
        this.serverId = ClientManager.Instance.getId();
        this._init();
    }

    private _init(): void {
        this.socket.on('message', this._resaveMassage.bind(this));
        this.socket.on('close', this._serverClientClose.bind(this));
    }

    /**
     * 接收消息
     * @param message 
     */
    private _resaveMassage(message: any): void {
        this.dataType = typeof (message);
        if (this.dataType == 'string') {
            Logger.info(message);
        }
        else {
            /* 这里用的是websockt.client库,需要用message.binaryData */
            let buf = new Uint8Array(message.binaryData).buffer;
            let dtView = new DataView(buf);
            let head: Head = DataViewUtils.getHeadData(dtView);
            console.log("head" + JSON.stringify(head));
            let body = DataViewUtils.decoding(dtView, buf.byteLength);
            this._handleClientData(head, body);
        }
    }

    /**
     * 向子服务器发送消息
     * @param {JSON} data 
     */
    public sendMsg(router: string, body: any, id: number): void {
        Logger.info("-----------------sendServerMsg-----------------");
        Logger.info(router, body);
        let serverType = this.serverType;
        if (this.dataType == 'string') {
            this.socket.send(JSON.stringify({ id: id, serverType: serverType, router: Number(router), body: body }));
        }
        else {
            let data = DataViewUtils.encoding(id, serverType, Number(router), body);
            this.socket.sendBytes(data);
        }
    }

    private async _handleClientData(head: Head, data: any): Promise<any> {
        Logger.info("-----------------resaveServerMsg-----------------");
        Logger.info(head, data);
        /* 将数据转发给客户端 */
        switch (head.router) {
            case Router.rut_upLine://上线
                ClientManager.Instance.pushUpLineToAllClient(head.id);
                break;

            case Router.rut_downLine://下线
                ClientManager.Instance.pushDownLineToAllClient(head.id);
                break;

            case Router.rut_roomList://房间列表
                let client: ClientSocket = ClientManager.Instance.getClientSocketById(head.id);
                if (client) {
                    client.pushRoomListToClient(data);
                }
                break;

            case Router.rut_roomListPush://全玩家推送房间列表
                ClientManager.Instance.pushUpdateRoomToAllClient(data);
                break;

            case Router.rut_createRoom://进入房间
                let dt: ModelAny = data;
                if (dt.code == ErrEnum.OK) {
                    let crr: createRoomRes = dt.msg;
                    for (let i = 0; i < crr.userList.length; i++) {
                        let userId = crr.userList[i];
                        let cl: ClientSocket = ClientManager.Instance.getClientSocketById(userId);
                        if (cl) {
                            cl.roomId = dt.msg.roomId;
                            cl.sendMsg(head.router, dt, ServerType.gameServer);
                        }
                    }
                    ClientManager.Instance.pushJoinRoomToAllClient(head.id);
                }
                break;

            case Router.rut_leaveRoom://离开房间
                let user: User = data.msg;
                let uLeave: ClientSocket = ClientManager.Instance.getClientSocketById(user.id);
                uLeave.roomId = -1;
                ClientManager.Instance.pushLeaveRoomToAllClient(user.id);
                break;

            case Router.rut_playChess://走棋/落子
                let cl: ClientSocket = ClientManager.Instance.getClientSocketById(head.id);
                if (cl) {
                    cl.sendMsg(head.router, data, ServerType.gameServer);
                }
                break;

            case Router.rut_eatChess://吃棋
                let crr: eatChessReq = data.msg;
                for (let i = 0; i < crr.userlist.length; i++) {
                    let userId = crr.userlist[i];
                    let cl: ClientSocket = ClientManager.Instance.getClientSocketById(userId);
                    if (cl) {
                        cl.sendMsg(head.router, data, ServerType.gameServer);
                    }
                }
                break;
            case Router.rut_restart://重新开始,清理房间和房间Id
                let rsData: restartReq = data.msg;
                for (let i = 0; i < rsData.userList.length; i++) {
                    let userId = rsData.userList[i];
                    let cl: ClientSocket = ClientManager.Instance.getClientSocketById(userId);
                    if (cl) {
                        if (cl.id == head.id) {
                            cl.roomId = -1;
                        }
                        cl.sendMsg(head.router, data, ServerType.gameServer);
                    }
                }
                break;

            default: break;
        }
    }

    private _serverClientClose(client: any): void {
        Logger.info("server_close " + client + "  id= " + this.serverId + "  serverType= " + this.serverType);
        setTimeout(() => {
            Net.Instance.startConnect(this.ip, this.port, this.serverType);
        }, 3000)
    }


}

