import ClientManager from "../common/clientManager";
import { createRoomReq, createRoomRes, eatChessReq, Head, ModelAny, moveReq, playChessReq, playerInfoRes, restartReq, upLineReq, User } from "../utils/globalUtils";
import DataViewUtils from "../utils/dataviewUtils";
import Logger from "../utils/logger";
import { Router } from "../controller/routers";
import { ErrEnum } from "../utils/err";
import EventManager from "../common/EventManager";
import ServerClientSocket from "./serverClientSocket";
import { ServerType } from "../../config/config";

/* 客户端连接socket类 */
export default class ClientSocket {
    /* socket连接对象，收发数据 */
    public socket: any;
    public id: number = 0;
    public serverType: number = 0;
    private dataType: any;
    public roomId: number = -1;

    constructor(socket: any) {
        this.socket = socket;
        this.id = ClientManager.Instance.getId();
        this._init();
    }

    private _init(): void {
        this.socket.on('message', this._resaveMassage.bind(this));
        this.socket.on('close', this._clientClose.bind(this));
        /* 用户上线 */
        let data: upLineReq = { id: this.id };
        let router: string = Router.rut_upLine;
        this.sendMsgToServer(ServerType.userServer, router, data, data.id);
        /* 请求房间列表 */
        this.reqeustRoomList();
        this.pushPlayerListToClient();
    }

    /**
     * 请求房间列表
     */
    private reqeustRoomList() {
        let data: upLineReq = { id: this.id }
        let router: string = Router.rut_roomList;
        this.sendMsgToServer(ServerType.gameServer, router, data, data.id);
    }

    /**
     * 接收消息
     * @param message 
     */
    private _resaveMassage(message: any): void {
        this.dataType = typeof (message);
        console.log("datatype: " + this.dataType);
        if (this.dataType == 'string') {
            Logger.info(message);
        }
        else {
            let buf = new Uint8Array(message).buffer;
            let dtView = new DataView(buf);
            let head: Head = DataViewUtils.getHeadData(dtView);
            let body = DataViewUtils.decoding(dtView, buf.byteLength);
            this.serverType = head.serverType;
            this._handleClientData(head, body);
        }
    }

    /**
     * 发送消息
     * @param {JSON} data 
     */
    public sendMsg(router: string, body: any, serverType: number): void {
        Logger.info("-----------------sendMsg-----------------");
        Logger.info(router, body);
        let id = this.id;
        if (this.dataType == 'string') {
            this.socket.send(JSON.stringify({ id: id, serverType: serverType, router: Number(router), body: body }));
        }
        else {
            let data = DataViewUtils.encoding(id, serverType, Number(router), body);
            this.socket.send(data);
        }
    }

    /**
     * 向服务器发送数据
     * @param serverType 
     * @param router 
     * @param data 
     */
    sendMsgToServer(serverType: number, router: string, data: any, id) {
        let server: ServerClientSocket = ClientManager.Instance.getServerClientSocketByType(serverType);
        if (server) {
            server.sendMsg(router, data, id);
        }
    }

    private _clientClose(client: any): void {
        Logger.info("client_close " + client + "  id= " + this.id + " roomId= " + this.roomId);
        /* 用户下线 */
        let data: upLineReq = { id: this.id };
        let router: string = Router.rut_downLine;
        this.sendMsgToServer(ServerType.userServer, router, data, data.id);
        EventManager.Instance.dispatchEvent(EventManager.EvtRemoveClientSocket, this);
        /* 刷新房间列表信息 */
        let user: User = { id: this.id, roomId: this.roomId };
        this.sendMsgToServer(ServerType.gameServer, router, user, user.id);

    }

    private async _handleClientData(head: Head, data: any): Promise<any> {
        Logger.info("-----------------resaveMsg-----------------");
        Logger.info(head, data);
        /* 将数据转发给客户端 */
        switch (head.router) {
            case Router.rut_createRoom:
                let dt: createRoomReq = data;
                this.sendMsgToServer(ServerType.gameServer, head.router, dt, this.id);
                break;

            case Router.rut_leaveRoom:
                let user: User = { id: this.id, roomId: this.roomId };
                this.sendMsgToServer(ServerType.gameServer, head.router, user, user.id)
                break;

            case Router.rut_move:
                ClientManager.Instance.pushMoveInfoToAllClient(data);
                break;

            case Router.rut_playChess:
                let pcData: playChessReq = data;
                this.sendMsgToServer(ServerType.gameServer, head.router, pcData, this.id);
                break;

            case Router.rut_eatChess:
                this.sendMsgToServer(ServerType.gameServer, head.router, data, this.id);
                break;

            case Router.rut_restart:
                this.sendMsgToServer(ServerType.gameServer, head.router, data, this.id);
                break;

            default: break;
        }
    }

    /**
     * 用户上线
     * @id:玩家id
     */
    pushUplineToClient(id: number) {
        let reData: ModelAny = { code: ErrEnum.OK };
        reData.msg = { id: id };
        this.sendMsg(Router.rut_upLine, reData, ServerType.userServer);
    }

    /**
     * 用户下线
     * @id:玩家id
     */
    pushDownlineToClient(id: number) {
        let reData: ModelAny = { code: ErrEnum.OK };
        reData.msg = { id: id };
        this.sendMsg(Router.rut_downLine, reData, ServerType.userServer);
    }

    /**
     * 给玩家推送玩家列表
     */
    pushPlayerListToClient() {
        let reData: ModelAny = { code: ErrEnum.OK };
        let dt: playerInfoRes = { id: [] };
        let rmList: ClientSocket[] = ClientManager.Instance.getAllClient();
        for (let i = 0; i < rmList.length; i++) {
            let id: number = rmList[i].id;
            dt.id.push(id);
        }
        reData.msg = dt;
        this.sendMsg(Router.rut_playerInfo, reData, ServerType.userServer);
    }

    /**
     * 给玩家推送房间列表,玩家加入/退出房间的时候也要推送这个消息,给所有玩家推送
     */
    pushRoomListToClient(data: ModelAny) {
        //没做数据库,就从游戏服务器取数据
        let reData: ModelAny = data;
        this.sendMsg(Router.rut_roomList, reData, ServerType.gameServer);
    }

    /**
     * 进入房间
     * @id:玩家id
     */
    pushJoinRoomToClient(id) {
        let reData: ModelAny = { code: ErrEnum.OK };
        reData.msg = { id: id };
        this.sendMsg(Router.rut_joinRoom, reData, id);
    }

    /**
     * 离开房间
     * @id:玩家id
     */
    pushLeaveRoomToClient(id: number) {
        let reData: ModelAny = { code: ErrEnum.OK };
        reData.msg = { id: id };
        this.sendMsg(Router.rut_leaveRoom, reData, ServerType.gameServer);
    }

    /**
     * 推送移动数据
     * @param data 
     */
    pushMoveInfoToClient(data: moveReq) {
        let reData: ModelAny = { code: ErrEnum.OK };
        reData.msg = data;
        this.sendMsg(Router.rut_move, reData, ServerType.connectorServer);
    }

}

