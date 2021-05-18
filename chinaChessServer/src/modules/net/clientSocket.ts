import ClientManager from "../common/clientManager";
import { createRoomReq, createRoomRes, eatChessReq, Head, ModelAny, moveReq, playChessReq, playerInfoRes, restartReq, upLineReq } from "../utils/globalUtils";
import DataViewUtils from "../utils/dataviewUtils";
import Logger from "../utils/logger";
import { Router } from "../controller/routers";
import { ErrEnum } from "../utils/err";
import EventManager from "../common/EventManager";
import Room from "../controller/room";

/* 客户端连接socket类 */
export default class ClientSocket {
    /* socket连接对象，收发数据 */
    public socket: any;
    public id: number = 0;
    public serverType: number = 0;
    private dataType: any;
    public roomId: number = -1;
    private isLogined: boolean = false;

    constructor(socket: any) {
        this.socket = socket;
        this.id = ClientManager.Instance.getId();
        this._init();
    }

    private _init(): void {
        this.socket.on('message', this._resaveMassage.bind(this));
        this.socket.on('close', this._clientClose.bind(this));
        this.pushRoomListToClient();
        this.pushPlayerListToClient();
    }

    /**
     * 接收消息
     * @param message 
     */
    private _resaveMassage(message: any): void {
        this.dataType = typeof (message);
        if (this.dataType == 'string') {
            Logger.info(message);
            // this.socket.send("333");
        }
        else {
            let buf = new Uint8Array(message).buffer;
            let dtView = new DataView(buf);
            let head: Head = DataViewUtils.getHeadData(dtView);
            let body = DataViewUtils.decoding(dtView, buf.byteLength);
            this.serverType = head.serverType;
            this._handleClientData(head.router, body);
        }
    }

    /**
     * 发送消息
     * @param {JSON} data 
     */
    public sendMsg(router: string, body: any): void {
        Logger.info("-----------------sendMsg-----------------");
        Logger.info(router, body);
        let id = this.id;
        let serverType = this.serverType;
        if (this.dataType == 'string') {
            this.socket.send(JSON.stringify({ id: id, serverType: serverType, router: Number(router), body: body }));
        }
        else {
            let data = DataViewUtils.encoding(id, serverType, Number(router), body);
            this.socket.send(data);
        }
    }

    private _clientClose(client: any): void {
        Logger.info("client_close " + client + "  id= " + this.id + " roomId= " + this.roomId);
        this.isLogined = false;
        EventManager.Instance.dispatchEvent(EventManager.EvtRemoveClientSocket, this);
    }

    private async _handleClientData(router: string, data: any): Promise<any> {
        Logger.info("-----------------resaveMsg-----------------");
        Logger.info(router, data);
        switch (router) {
            case Router.rut_createRoom:
                this.handleCreateJoinRoom(data);
                break;

            case Router.rut_playChess:
                this.handlePlayChess(data);
                break;

            case Router.rut_eatChess:
                this.handleEatChess(data);
                break;

            case Router.rut_restart:
                this.handleRestart(data);
                break;

            case Router.rut_leaveRoom:
                this.handleLeaveRoom(data);
                break;

            case Router.rut_move:
                this.handleMove(data);
                break;

            default: break;
        }
    }

    /**
     * 创建/加入房间
     * @param data 
     */
    private async handleCreateJoinRoom(data: createRoomReq) {
        if (this.roomId > 0) {
            Logger.info("已在房间");
            return;
        }
        let reData: ModelAny = { code: ErrEnum.OK };
        let rm: Room = ClientManager.Instance.createJoinRoom(this, data.roomId);
        let roomData: createRoomRes = { roomId: rm.id, count: rm.count };
        reData.msg = roomData;
        rm.createJoinRoom(reData);
        ClientManager.Instance.pushJoinRoomToAllClient(this.id);
        ClientManager.Instance.pushUpdateRoomToAllClient();
    }

    /**
     * 走棋/落子
     * @param data 
     */
    private async handlePlayChess(data: playChessReq) {
        let room: Room = ClientManager.Instance.getRoomById(data.roomId);
        room.playChess(this, data);
    }

    /**
     * 吃棋
     */
    private async handleEatChess(data: eatChessReq) {
        let room: Room = ClientManager.Instance.getRoomById(data.roomId);
        room.eatChess(this, data);
    }

    /**
     * 重新开始,清理房间和房间Id
     */
    private async handleRestart(data: restartReq) {
        ClientManager.Instance.pushLeaveRoomToAllClient(this.id);
        ClientManager.Instance.removeFromRoom(this, data);
        ClientManager.Instance.pushUpdateRoomToAllClient();
    }

    /**
     * 离开房间
     */
    private async handleLeaveRoom(data: restartReq) {
        ClientManager.Instance.pushLeaveRoomToAllClient(this.id);
        ClientManager.Instance.removeFromRoom(this);
        ClientManager.Instance.pushUpdateRoomToAllClient();
    }

    /**
     * 给玩家推送房间列表,玩家加入/退出房间的时候也要推送这个消息,给所有玩家推送
     */
    pushRoomListToClient() {
        let reData: ModelAny = { code: ErrEnum.OK };
        let dt: createRoomRes[] = [];
        let rmList: Room[] = ClientManager.Instance.roomList;
        for (let i = 0; i < rmList.length; i++) {
            let rd: createRoomRes = { roomId: rmList[i].id, count: rmList[i].count };
            dt.push(rd);
        }
        reData.msg = dt;
        this.sendMsg(Router.rut_roomList, reData);
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
        this.sendMsg(Router.rut_playerInfo, reData);
    }

    /**
     * 角色移动
     * @param data 
     */
    handleMove(data: moveReq) {
        ClientManager.Instance.pushMoveInfoToAllClient(data);
    }

    /**
     * 推送移动数据
     * @param data 
     */
    pushMoveInfoToClient(data: moveReq) {
        let reData: ModelAny = { code: ErrEnum.OK };
        reData.msg = data;
        this.sendMsg(Router.rut_move, reData);
    }

    /**
     * 用户上线
     * @id:玩家id
     */
    pushUplineToClient(id: number) {
        let reData: ModelAny = { code: ErrEnum.OK };
        reData.msg = { id: id };
        this.sendMsg(Router.rut_upLine, reData);
    }

    /**
     * 用户下线
     * @id:玩家id
     */
    pushDownlineToClient(id: number) {
        let reData: ModelAny = { code: ErrEnum.OK };
        reData.msg = { id: id };
        this.sendMsg(Router.rut_downLine, reData);
    }

    /**
     * 进入房间
     * @id:玩家id
     */
    pushJoinRoomToClient(id: number) {
        let reData: ModelAny = { code: ErrEnum.OK };
        reData.msg = { id: id };
        this.sendMsg(Router.rut_joinRoom, reData);
    }

    /**
     * 离开房间
     * @id:玩家id
     */
    pushLeaveRoomToClient(id: number) {
        let reData: ModelAny = { code: ErrEnum.OK };
        reData.msg = { id: id };
        this.sendMsg(Router.rut_leaveRoom, reData);
    }
}

